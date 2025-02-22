/// <reference path="../../lib/openrct2.d.ts" />

import { WindowTemplate, checkbox, window, spinner, label, store, WritableStore, Colour, compute, horizontal } from "openrct2-flexui"

export function formatMoney(value: number): string {
    return "$" + (value / 10).toFixed(1) + "0";
}

let wt: WindowTemplate;

export const isEnabled: WritableStore<boolean> = store<boolean>(false);
export const threshold: WritableStore<number> = store<number>(50)
export const requireSecurity: WritableStore<boolean> = store<boolean>(false);
export const guestsRemoved: WritableStore<number> = store<number>(0);
export const notifyEnabled: WritableStore<boolean> = store<boolean>(false);

export function initialize() {
    wt = window({
        title: "No Loitering!!",
        width: { value: 220, min: 220, max: 220 },
        height: { value: 115, min: 115, max: 115 },
        colours: [Colour.DarkBrown, Colour.DarkBrown],
        content: [
            checkbox({
                text: "Disallow Loitering",
                onChange: (checked: boolean) => {
                    isEnabled.set(checked)
                },
                isChecked: isEnabled
            }),
            horizontal([
                label({
                    text: "Eviction Threshold:",
                }),
                spinner({
                    minimum: 0,
                    step: 10,
                    value: threshold,
                    onChange: (value: number) => {
                        threshold.set(value);
                    },
                    format: formatMoney,
                    tooltip: "Firmly suggest that guests leave when their cash on hand falls below this threshold."
                })]),
            checkbox({
                text: "Require security guard intervention",
                isChecked: requireSecurity,
                onChange: (checked: boolean) => {
                    requireSecurity.set(checked)
                },
                disabled: compute(isEnabled, (ie) => {
                    return !ie
                }),
                tooltip: "When checked, loitering guests will only leave once they cross paths with a security guard."
            }),
            checkbox({
                text: "Notify upon eviction",
                isChecked: notifyEnabled,
                onChange: (checked: boolean) => {
                    notifyEnabled.set(checked)
                },
                disabled: compute(isEnabled, (ie) => {
                    return !ie
                }),
                tooltip: "When checked, send notification when guest is evicted from park."
            }),
            label({
                text: compute(guestsRemoved, (g) => {
                    return `Guests evicted: ${g}`;
                }),
                disabled: true,
                alignment: "centred"
            })
        ]
    })
};

export function openWindow() {
    wt.open();
}
