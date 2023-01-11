/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import { Component, OnInit, OnDestroy } from "@angular/core";
import { SharedMap } from "fluid-framework";
import { TinyliciousClient } from "@fluidframework/tinylicious-client";

@Component({
	selector: "app-root",
	templateUrl: "./app.component.html",
	styleUrls: ["./app.component.css"],
})
export class AppComponent implements OnInit, OnDestroy {
	diceMap: SharedMap | undefined;
	localRoll: number | undefined;
	updateDice: (() => void) | undefined;
	diceValueKey = "dice-value-key";
	async ngOnInit() {
		this.diceMap = await this.getFluidData();
		this.syncData();
	}

	async getFluidData() {
		// TODO 1: Configure the container.
		const client = new TinyliciousClient();
		const containerSchema = {
			initialObjects: { diceMap: SharedMap },
		};

		// TODO 2: Get the container from the Fluid service.
		let container;
		const containerId = location.hash.substring(1);
		console.log(containerId);
		if (!containerId) {
			({ container } = await client.createContainer(containerSchema));
			(container.initialObjects.diceMap as SharedMap).set(this.diceValueKey, 1);
			const id = await container.attach();
			location.hash = id;
		} else {
			({ container } = await client.getContainer(containerId, containerSchema));
		}

		// TODO 3: Return the Fluid timestamp object.
		return container.initialObjects.diceMap as SharedMap;
	}

	syncData() {
		// Only sync if the Fluid SharedMap object is defined.
		if (this.diceMap) {
			// TODO 4: Set the value of the localTimestamp state object that will appear in the UI.
			this.updateDice = () => {
				this.localRoll = this.diceMap!.get("dice-value-key");
			};
			this.updateDice();

			// TODO 5: Register handlers.
			this.diceMap!.on("valueChanged", this.updateDice!);
		}
	}

	getDiceIcon() {
		return String.fromCodePoint(0x267f + (this.localRoll ?? 0))
	}

	onButtonClick() {
		this.diceMap?.set(this.diceValueKey, Math.floor(Math.random() * 6) + 1);
	}

	ngOnDestroy() {
		// Delete handler registration when the Angular App component is dismounted.
		this.diceMap?.off("valueChanged", this.updateDice!);
	}
}
