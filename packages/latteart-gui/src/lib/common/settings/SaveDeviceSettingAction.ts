/**
 * Copyright 2022 NTT Corporation.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {
  ActionResult,
  ActionFailure,
  ActionSuccess,
} from "@/lib/common/ActionResult";
import { LocalStorageSettingRepository } from "@/lib/common/LocalStorageSettingRepository";
import { DeviceSettings } from "@/lib/common/settings/Settings";

const SAVE_DEVICE_SETTING_FAILED_MESSAGE_KEY =
  "error.capture_control.save_device_settings_failed";

export class SaveDeviceSettingAction {
  public async saveDeviceSettings(deviceSettings: {
    config: DeviceSettings;
  }): Promise<ActionResult<{ config: DeviceSettings }>> {
    const putDeviceSettingsResult =
      await new LocalStorageSettingRepository().putDeviceSettings(
        deviceSettings
      );

    if (putDeviceSettingsResult.isFailure()) {
      return new ActionFailure({
        messageKey: SAVE_DEVICE_SETTING_FAILED_MESSAGE_KEY,
      });
    }

    return new ActionSuccess(putDeviceSettingsResult.data);
  }
}
