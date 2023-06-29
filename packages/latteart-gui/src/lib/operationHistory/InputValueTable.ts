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

import { ElementInfo, VideoFrame } from "latteart-client";
import { Edge } from "./graphConverter/ScreenTransitionDiagramGraphConverter";

export type InputValueTableHeaderColumn = {
  index: number;
  sourceScreenDef: string;
  targetScreenDef: string;
  trigger: { elementText: string; eventType: string };
  notes: {
    sequence: number;
    id: string;
    tags: string[];
    value: string;
    details: string;
    timestamp: number;
    image?: { imageFileUrl?: string; videoFrame?: VideoFrame };
  }[];
  testPurposes: { id: string; value: string; details: string }[];
};

export type InputValueTableRow = {
  elementId: string;
  elementName: string;
  elementType: string;
  elementImage?: {
    image: { imageFileUrl?: string; videoFrame?: VideoFrame };
    elementInfo: Pick<
      ElementInfo,
      | "boundingRect"
      | "innerHeight"
      | "innerWidth"
      | "outerHeight"
      | "outerWidth"
    >;
  };
  inputs: Array<{ value: string; isDefaultValue: boolean }>;
};

/**
 * Class that handles input value table.
 */
export default class InputValueTable {
  constructor(private edges: Edge[] = []) {}

  /**
   * Get column size.
   */
  public get columnSize(): number {
    return this.edges.flatMap((edge) => edge.details).length;
  }

  /**
   * Get column header.
   */
  public get headerColumns(): InputValueTableHeaderColumn[] {
    return this.edges
      .flatMap((edge) =>
        edge.details.map((details) => {
          return {
            sourceScreenDef: edge.sourceScreen.name,
            targetScreenDef: edge.destScreen.name,
            trigger: {
              elementText: edge.trigger?.target?.text ?? "",
              eventType: edge.trigger?.type ?? "",
            },
            notes: details.notes,
            testPurposes: details.testPurposes,
          };
        })
      )
      .map((screenTransition, index) => {
        return { index, ...screenTransition };
      });
  }

  /**
   * Get all lines.
   */
  public get rows(): InputValueTableRow[] {
    const edgeDetails = this.edges.flatMap((edge) => edge.details);

    const inputElements = edgeDetails.flatMap(
      ({ inputElements }) => inputElements
    );

    const inputs = edgeDetails.flatMap(({ inputElements }) => {
      return inputElements.map((element) => {
        const input = element.inputs.at(-1);

        if (input === undefined) {
          return {
            xpath: element.xpath,
            value: element.defaultValue ?? "",
            isDefaultValue: true,
          };
        }

        return {
          xpath: element.xpath,
          value: input.value,
          isDefaultValue: false,
        };
      });
    });

    return inputElements
      .filter(({ xpath: xpath1 }, index, array) => {
        return (
          array.findIndex(({ xpath: xpath2 }) => xpath2 === xpath1) === index
        );
      })
      .map((element) => {
        return {
          elementId: element.attributes["id"] ?? "",
          elementName: element.attributes["name"] ?? "",
          elementType: element.attributes["type"] ?? "",
          elementImage: element.image
            ? {
                image: element.image,
                elementInfo: {
                  boundingRect: element.boundingRect,
                  innerHeight: element.innerHeight,
                  innerWidth: element.innerWidth,
                  outerHeight: element.outerHeight,
                  outerWidth: element.outerWidth,
                },
              }
            : undefined,
          inputs: inputs
            .filter(({ xpath }) => element.xpath === xpath)
            .map(({ value, isDefaultValue }) => {
              return { value, isDefaultValue };
            }),
        };
      });
  }

  /**
   * Get screen transition.
   * @returns Screen transitions.
   */
  public getScreenTransitions(): (Pick<Edge, "trigger"> &
    Pick<Edge["details"][0], "inputElements" | "pageTitle" | "pageUrl">)[] {
    return this.edges.flatMap((edge) => {
      return edge.details;
    });
  }
}
