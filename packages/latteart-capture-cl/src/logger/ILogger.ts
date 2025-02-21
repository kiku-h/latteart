/**
 * Copyright 2025 NTT Corporation.
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

/**
 * The interface for logging.
 */
export default interface ILogger {
  /**
   * Output a DEBUG level log.
   * @param message Log message.
   */
  debug(message: string): void;

  /**
   * Output a INFO level log.
   * @param message Log message.
   */
  info(message: string): void;

  /**
   * Output a WARN level log.
   * @param message Log message.
   */
  warn(message: string): void;

  /**
   * Output a ERROR level log.
   * @param message Log message.
   */
  error(message: string): void;
}
