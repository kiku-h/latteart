import {
  RESTClientResponse,
  RESTClient,
} from "@/lib/eventDispatcher/RESTClient";
import { TestResultRepository } from "@/lib/eventDispatcher/repositoryService/TestResultRepository";
import { GetTestResultListAction } from "@/lib/operationHistory/actions/testResult/GetTestResultListAction";

const baseRestClient: RESTClient = {
  httpGet: jest.fn(),
  httpPost: jest.fn(),
  httpPut: jest.fn(),
  httpPatch: jest.fn(),
  httpDelete: jest.fn(),
};

describe("GetTestResultListAction", () => {
  describe("#getTestResults", () => {
    describe("テスト結果のリストを取得する", () => {
      const expectedData = [
        { id: "id_1", name: "name_1", source: "" },
        { id: "id_2", name: "name_2", source: "source_1" },
      ];
      const resSuccess: RESTClientResponse = {
        status: 200,
        data: expectedData,
      };

      const resFailure: RESTClientResponse = {
        status: 500,
        data: { code: "errorcode", message: "errormessage" },
      };

      it("取得に成功した場合は、取得したテスト結果リストを返す", async () => {
        const restClient = {
          ...baseRestClient,
          httpGet: jest.fn().mockResolvedValue(resSuccess),
        };

        const action = new GetTestResultListAction({
          testResultRepository: new TestResultRepository(restClient),
        });

        const result = await action.getTestResults();

        expect(restClient.httpGet).toBeCalledWith(`/test-results`);

        if (result.isSuccess()) {
          expect(result.data).toEqual(expectedData);
        } else {
          throw new Error("failed");
        }
      });

      it("取得に失敗した場合は、エラー情報を返す", async () => {
        const restClient = {
          ...baseRestClient,
          httpGet: jest.fn().mockResolvedValue(resFailure),
        };

        const action = new GetTestResultListAction({
          testResultRepository: new TestResultRepository(restClient),
        });

        const result = await action.getTestResults();

        expect(restClient.httpGet).toBeCalledWith(`/test-results`);

        if (result.isSuccess()) {
          throw new Error("failed");
        } else {
          expect(result.error).toEqual({
            messageKey: "error.operation_history.get_test_result_list_failed",
          });
        }
      });
    });
  });
});
