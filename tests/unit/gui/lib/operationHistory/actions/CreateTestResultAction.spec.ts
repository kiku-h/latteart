import {
  RESTClientResponse,
  RESTClient,
} from "@/lib/eventDispatcher/RESTClient";
import { TestResultRepository } from "@/lib/eventDispatcher/repositoryService/TestResultRepository";
import { CreateTestResultAction } from "@/lib/operationHistory/actions/testResult/CreateTestResultAction";

const baseRestClient: RESTClient = {
  httpGet: jest.fn(),
  httpPost: jest.fn(),
  httpPut: jest.fn(),
  httpPatch: jest.fn(),
  httpDelete: jest.fn(),
};

describe("CreateTestResultAction", () => {
  describe("#createTestResult", () => {
    describe("新しいテスト結果を作成する", () => {
      const initialUrl = "url";
      const name = "name";
      const source = "source";
      const expectedData = { id: "id", name, source };
      const resSuccess: RESTClientResponse = {
        status: 200,
        data: expectedData,
      };

      const resFailure: RESTClientResponse = {
        status: 500,
        data: { code: "errorcode", message: "errormessage" },
      };

      it("作成に成功した場合は、作成したテスト結果のサマリを返す", async () => {
        const restClient = {
          ...baseRestClient,
          httpPost: jest.fn().mockResolvedValue(resSuccess),
        };

        const action = new CreateTestResultAction({
          testResultRepository: new TestResultRepository(restClient),
        });

        const result = await action.createTestResult(initialUrl, name, source);

        expect(restClient.httpPost).toBeCalledWith(`/test-results`, {
          initialUrl,
          name,
          source,
        });

        if (result.isSuccess()) {
          expect(result.data).toEqual(expectedData);
        } else {
          throw new Error("failed");
        }
      });

      it("作成に失敗した場合は、エラー情報を返す", async () => {
        const restClient = {
          ...baseRestClient,
          httpPost: jest.fn().mockResolvedValue(resFailure),
        };

        const action = new CreateTestResultAction({
          testResultRepository: new TestResultRepository(restClient),
        });

        const result = await action.createTestResult(initialUrl, name, source);

        expect(restClient.httpPost).toBeCalledWith(`/test-results`, {
          initialUrl,
          name,
          source,
        });

        if (result.isSuccess()) {
          throw new Error("failed");
        } else {
          expect(result.error).toEqual({
            messageKey: "error.operation_history.create_test_result_failed",
          });
        }
      });
    });
  });
});
