import { isEnabled, threshold, requireSecurity, guestsRemoved, notifyEnabled, formatMoney } from "./window";

const tickFrequency = 256;

const queueAdd: number[] = [];
const queueRemove: number[] = [];

let guests: number[] = [];
let queueLeavePark: number[] = [];
let securityGuards: Staff[] = [];

export function initialize() {
    guests = map
        .getAllEntities("guest")
        .filter((guest) => guest.id !== null)
        .map((guest) => guest.id as number);

    securityGuards = map.getAllEntities('staff').filter((staff) => staff.staffType === 'security');
    context.subscribe("guest.generation", (e) => queueAdd.push(e.id));
    context.subscribe("interval.tick", () => processGuests());
}

function processGuests() {
    if (!isEnabled.get()) {
        return;
    }

    const tick = date.ticksElapsed % tickFrequency;
    if (tick === 0) {
        securityGuards = map.getAllEntities('staff').filter((staff) => staff.staffType === 'security');
        updateQueues();
    }

    for (let index = tick; index < guests.length; index += tickFrequency) {
        processGuest(guests[index]);
    }

}

function updateQueues() {
    queueAdd.forEach((id) => guests.push(id));
    queueRemove.forEach((id) => guests.splice(guests.indexOf(id), 1));

    queueLeavePark = queueLeavePark.filter((id) => queueRemove.indexOf(id) >= 0);
    queueAdd.splice(0, queueAdd.length);
    queueRemove.splice(0, queueRemove.length);
}

function notify(notificationMessage: string, subjectPeep: number) {
    console.log(notificationMessage);
    if (notifyEnabled.get()) {
        park.postMessage({ type: "peep", text: notificationMessage, subject: subjectPeep })
    }
}

function processGuest(id: number) {
    const guest = map.getEntity(id) as Guest;
    if (guest === null) {
        queueRemove.push(id);
    } else if ((guest.cash < threshold.get() && (guest.getFlag("leavingPark") === false))) {
        if (!requireSecurity.get()) {
            guest.setFlag("leavingPark", true);
            guestsRemoved.set(guestsRemoved.get() + 1)
            notify(`Guest ${guest.name} is leaving the park--cash ${formatMoney(guest.cash)} is less than threshold ${formatMoney(threshold.get())}`, id);
        } else {
            for (const sg of securityGuards) {
                if ((guest.x <= sg.x + 16 && guest.x >= sg.x - 16) && (guest.y <= sg.y + 16 && guest.y >= sg.y - 16) && (guest.z == sg.z)) {
                    guest.setFlag("leavingPark", true);
                    guestsRemoved.set(guestsRemoved.get() + 1)
                    notify(`Guest ${guest.name} is leaving the park--they were caught loitering by ${sg.name}`, id);
                    break;
                }
            };
        }
    }
}