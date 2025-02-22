import * as guests from "./data/guests";
import * as window from './data/window';


export function startup() {
	window.initialize();
	guests.initialize();
	ui.registerMenuItem("No Loitering", window.openWindow);
}