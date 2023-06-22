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

import { GetNoteResponse } from "@/interfaces/Notes";
import { Session } from "@/interfaces/Sessions";
import path from "path";

export function createAttachedFiles(
  storyId: string,
  sessionIdAlias: string,
  attachedFiles: Session["attachedFiles"]
): Session["attachedFiles"] {
  return attachedFiles.map((attachedFile) => {
    return {
      name: attachedFile.name,
      fileUrl: `data/${storyId}/${sessionIdAlias}/attached/${path.basename(
        attachedFile?.fileUrl ?? ""
      )}`,
    };
  });
}

export function createTestResultFiles(
  testResultFiles: Session["testResultFiles"]
): Session["testResultFiles"] {
  return testResultFiles.map((testResultFile) => {
    return { name: testResultFile.name, id: testResultFile.id };
  });
}

export function createNotes(
  storyId: string,
  sessionIdAlias: string,
  notes: GetNoteResponse[]
): GetNoteResponse[] {
  return notes.map((note) => {
    return {
      id: note.id,
      type: note.type,
      value: note.value,
      details: note.details,
      imageFileUrl: `data/${storyId}/${sessionIdAlias}/testResult/${path.basename(
        note.imageFileUrl ?? ""
      )}`,
      tags: note.tags,
    };
  });
}
