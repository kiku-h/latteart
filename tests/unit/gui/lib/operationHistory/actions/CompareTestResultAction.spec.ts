import {
  RESTClientResponse,
  RESTClient,
} from "@/lib/eventDispatcher/RESTClient";
import { TestResultRepository } from "@/lib/eventDispatcher/repositoryService/TestResultRepository";
import { CompareTestResultAction } from "@/lib/operationHistory/actions/testResult/CompareTestResultAction";

const baseRestClient: RESTClient = {
  httpGet: jest.fn(),
  httpPost: jest.fn(),
  httpPut: jest.fn(),
  httpPatch: jest.fn(),
  httpDelete: jest.fn(),
};

describe("CompareTestResultAction", () => {
  describe("#compareTestResult", () => {
    describe("指定したテスト結果を比較し、比較結果をエクスポートする", () => {
      const expectedData = {
        url: "url",
        diffCount: 0,
        diffs: [],
        hasInvalidScreenshots: false,
      };
      const resSuccess: RESTClientResponse = {
        status: 200,
        data: expectedData,
      };

      const resFailure: RESTClientResponse = {
        status: 500,
        data: { code: "errorcode", message: "errormessage" },
      };

      const testResultId1 = "testResultId1";
      const testResultId2 = "testResultId2";

      it("エクスポートに成功した場合は、エクスポートされたファイルのダウンロードURLを返す", async () => {
        const restClient = {
          ...baseRestClient,
          httpPost: jest.fn().mockResolvedValue(resSuccess),
        };

        const action = new CompareTestResultAction({
          testResultRepository: new TestResultRepository(restClient),
        });

        const result = await action.compareTestResult(
          testResultId1,
          testResultId2
        );

        expect(restClient.httpPost).toBeCalledWith(
          `/test-results/${testResultId1}/diffs`,
          { targetTestResultId: testResultId2 }
        );

        if (result.isSuccess()) {
          expect(result.data).toEqual(expectedData);
        } else {
          throw new Error("failed");
        }
      });

      it("エクスポートに失敗した場合は、エラー情報を返す", async () => {
        const restClient = {
          ...baseRestClient,
          httpPost: jest.fn().mockResolvedValue(resFailure),
        };

        const action = new CompareTestResultAction({
          testResultRepository: new TestResultRepository(restClient),
        });

        const result = await action.compareTestResult(
          testResultId1,
          testResultId2
        );

        expect(restClient.httpPost).toBeCalledWith(
          `/test-results/${testResultId1}/diffs`,
          { targetTestResultId: testResultId2 }
        );

        if (result.isSuccess()) {
          throw new Error("failed");
        } else {
          expect(result.error).toEqual({
            messageKey: "error.operation_history.compare_test_result_failed",
          });
        }
      });
    });
  });
});
