/**
 * Copyright 2023 NTT Corporation.
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

import { createLogger } from "@/logger/logger";
import { ServerError } from "@/ServerError";
import { MoviesService } from "@/services/MoviesService";
import { Body, Controller, Patch, Path, Route } from "tsoa";

@Route("movies")
export class Movies extends Controller {
  @Patch("{testResultId}")
  public async patch(
    @Path() testResultId: string,
    @Body() requestBody: { base64: string }
  ): Promise<void> {
    try {
      await new MoviesService().append(testResultId, requestBody.base64);
    } catch (error) {
      if (error instanceof Error) {
        createLogger().error("Save movie failed.", error);

        throw new ServerError(500, {
          code: "save_movie_failed",
        });
      }
      throw error;
    }
  }
}
