import { checkPageAssertion } from "@/lib/assertionCheck";

describe("checkPageAssertion", () => {
  describe("指定のアサーションを用いて画面の各項目について一致判定を行う", () => {
    it("全ての項目が一致する場合は一致した旨を結果として返す", () => {
      const assertion = {
        actual: {
          title: "title",
          url: "url",
          elements: [],
        },
        expected: {
          title: "title",
          url: "url",
          elements: [],
        },
      };

      expect(checkPageAssertion(assertion)).toEqual({
        isEqual: true,
        diffs: {},
      });
    });

    describe("一致しない項目がある場合は一致しなかった旨と差異情報を結果として返す", () => {
      it.each`
        actual     | expected
        ${"title"} | ${"title2"}
        ${""}      | ${"title2"}
        ${"title"} | ${""}
      `(
        "ページタイトルが異なる場合: '$actual' '$expected'",
        ({ actual, expected }) => {
          const assertion = {
            actual: {
              title: actual,
              url: "url",
              elements: [],
            },
            expected: {
              title: expected,
              url: "url",
              elements: [],
            },
          };

          expect(checkPageAssertion(assertion)).toEqual({
            isEqual: false,
            diffs: {
              title: { actual, expected },
            },
          });
        }
      );

      it.each`
        actual   | expected
        ${"url"} | ${"url2"}
        ${""}    | ${"url2"}
        ${"url"} | ${""}
      `(
        "ページURLが異なる場合: '$actual' '$expected'",
        ({ actual, expected }) => {
          const assertion = {
            actual: {
              title: "title",
              url: actual,
              elements: [],
            },
            expected: {
              title: "title",
              url: expected,
              elements: [],
            },
          };

          expect(checkPageAssertion(assertion)).toEqual({
            isEqual: false,
            diffs: {
              url: { actual, expected },
            },
          });
        }
      );

      it.each`
        actual                                                   | expected                                                  | description
        ${[{ tagname: "tagname", textWithoutChildren: "hoge" }]} | ${[{ tagname: "tagname", textWithoutChildren: "huga" }]}  | ${"同じ位置の要素の文字列が異なる"}
        ${[{ tagname: "tagname", textWithoutChildren: "hoge" }]} | ${[{ tagname: "tagname2", textWithoutChildren: "hoge" }]} | ${"同じ位置の要素のタグ名が異なる"}
        ${[]}                                                    | ${[{ tagname: "tagname2", textWithoutChildren: "hoge" }]} | ${"実結果側に要素が無い"}
        ${[{ tagname: "tagname", textWithoutChildren: "hoge" }]} | ${[]}                                                     | ${"期待結果側に要素が無い"}
      `("画面要素が異なる場合: $description", ({ actual, expected }) => {
        const assertion = {
          actual: {
            title: "title",
            url: "url",
            elements: actual,
          },
          expected: {
            title: "title",
            url: "url",
            elements: expected,
          },
        };

        expect(checkPageAssertion(assertion)).toEqual({
          isEqual: false,
          diffs: {
            elements: { actual, expected },
          },
        });
      });
    });
  });
});
