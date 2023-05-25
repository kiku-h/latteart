import {MigrationInterface, QueryRunner} from "typeorm";

export class AddVideoEntity1684993943001 implements MigrationInterface {
    name = 'AddVideoEntity1684993943001'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "VIDEO" ("video_id" varchar PRIMARY KEY NOT NULL, "index" integer NOT NULL, "url" varchar NOT NULL, "start_timestamp" integer NOT NULL, "test_result_id" varchar)`);
        await queryRunner.query(`CREATE TABLE "temporary_NOTES" ("note_id" varchar PRIMARY KEY NOT NULL, "value" varchar NOT NULL, "details" varchar NOT NULL, "timestamp" integer NOT NULL, "test_result_id" varchar, "screenshot_id" varchar, "video_index" integer, CONSTRAINT "REL_0ffc136baa8c5b3beebd750481" UNIQUE ("screenshot_id"), CONSTRAINT "FK_0ffc136baa8c5b3beebd7504818" FOREIGN KEY ("screenshot_id") REFERENCES "SCREENSHOTS" ("screenshot_id") ON DELETE NO ACTION ON UPDATE NO ACTION, CONSTRAINT "FK_4868666b7bd48904f09ea21d4db" FOREIGN KEY ("test_result_id") REFERENCES "TEST_RESULTS" ("test_result_id") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_NOTES"("note_id", "value", "details", "timestamp", "test_result_id", "screenshot_id") SELECT "note_id", "value", "details", "timestamp", "test_result_id", "screenshot_id" FROM "NOTES"`);
        await queryRunner.query(`DROP TABLE "NOTES"`);
        await queryRunner.query(`ALTER TABLE "temporary_NOTES" RENAME TO "NOTES"`);
        await queryRunner.query(`CREATE TABLE "temporary_TEST_STEPS" ("test_step_id" varchar PRIMARY KEY NOT NULL, "window_handle" varchar NOT NULL, "page_title" varchar NOT NULL, "page_url" varchar NOT NULL, "keyword_texts" varchar NOT NULL, "operation_type" varchar NOT NULL, "operation_input" varchar NOT NULL, "operation_element" varchar NOT NULL, "input_elements" varchar NOT NULL, "timestamp" integer NOT NULL, "test_result_id" varchar, "test_purpose_id" varchar, "screenshot_id" varchar, "is_automatic" boolean DEFAULT (0), "scroll_position_x" integer, "scroll_position_y" integer, "client_size_width" integer, "client_size_height" integer, "video_index" integer, CONSTRAINT "REL_acf57d8cfbc3f63ebe7f0025aa" UNIQUE ("screenshot_id"), CONSTRAINT "FK_acf57d8cfbc3f63ebe7f0025aaa" FOREIGN KEY ("screenshot_id") REFERENCES "SCREENSHOTS" ("screenshot_id") ON DELETE NO ACTION ON UPDATE NO ACTION, CONSTRAINT "FK_bab22801448374f96a6828ccdb5" FOREIGN KEY ("test_purpose_id") REFERENCES "TEST_PURPOSES" ("test_purpose_id") ON DELETE SET NULL ON UPDATE NO ACTION, CONSTRAINT "FK_0bda1e0c86ad076da5e175a4d95" FOREIGN KEY ("test_result_id") REFERENCES "TEST_RESULTS" ("test_result_id") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_TEST_STEPS"("test_step_id", "window_handle", "page_title", "page_url", "keyword_texts", "operation_type", "operation_input", "operation_element", "input_elements", "timestamp", "test_result_id", "test_purpose_id", "screenshot_id", "is_automatic", "scroll_position_x", "scroll_position_y", "client_size_width", "client_size_height") SELECT "test_step_id", "window_handle", "page_title", "page_url", "keyword_texts", "operation_type", "operation_input", "operation_element", "input_elements", "timestamp", "test_result_id", "test_purpose_id", "screenshot_id", "is_automatic", "scroll_position_x", "scroll_position_y", "client_size_width", "client_size_height" FROM "TEST_STEPS"`);
        await queryRunner.query(`DROP TABLE "TEST_STEPS"`);
        await queryRunner.query(`ALTER TABLE "temporary_TEST_STEPS" RENAME TO "TEST_STEPS"`);
        await queryRunner.query(`CREATE TABLE "temporary_TEST_RESULTS" ("test_result_id" varchar PRIMARY KEY NOT NULL, "name" varchar NOT NULL, "start_timestamp" integer NOT NULL, "initial_url" varchar NOT NULL, "last_update_timestamp" integer NOT NULL, "testing_time" integer NOT NULL, "parent_test_result_id" varchar, "media_type" varchar NOT NULL DEFAULT (''))`);
        await queryRunner.query(`INSERT INTO "temporary_TEST_RESULTS"("test_result_id", "name", "start_timestamp", "initial_url", "last_update_timestamp", "testing_time", "parent_test_result_id") SELECT "test_result_id", "name", "start_timestamp", "initial_url", "last_update_timestamp", "testing_time", "parent_test_result_id" FROM "TEST_RESULTS"`);
        await queryRunner.query(`DROP TABLE "TEST_RESULTS"`);
        await queryRunner.query(`ALTER TABLE "temporary_TEST_RESULTS" RENAME TO "TEST_RESULTS"`);
        await queryRunner.query(`CREATE TABLE "temporary_VIDEO" ("video_id" varchar PRIMARY KEY NOT NULL, "index" integer NOT NULL, "url" varchar NOT NULL, "start_timestamp" integer NOT NULL, "test_result_id" varchar, CONSTRAINT "FK_f962f67aea2f97fd875305f4de5" FOREIGN KEY ("test_result_id") REFERENCES "TEST_RESULTS" ("test_result_id") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_VIDEO"("video_id", "index", "url", "start_timestamp", "test_result_id") SELECT "video_id", "index", "url", "start_timestamp", "test_result_id" FROM "VIDEO"`);
        await queryRunner.query(`DROP TABLE "VIDEO"`);
        await queryRunner.query(`ALTER TABLE "temporary_VIDEO" RENAME TO "VIDEO"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "VIDEO" RENAME TO "temporary_VIDEO"`);
        await queryRunner.query(`CREATE TABLE "VIDEO" ("video_id" varchar PRIMARY KEY NOT NULL, "index" integer NOT NULL, "url" varchar NOT NULL, "start_timestamp" integer NOT NULL, "test_result_id" varchar)`);
        await queryRunner.query(`INSERT INTO "VIDEO"("video_id", "index", "url", "start_timestamp", "test_result_id") SELECT "video_id", "index", "url", "start_timestamp", "test_result_id" FROM "temporary_VIDEO"`);
        await queryRunner.query(`DROP TABLE "temporary_VIDEO"`);
        await queryRunner.query(`ALTER TABLE "TEST_RESULTS" RENAME TO "temporary_TEST_RESULTS"`);
        await queryRunner.query(`CREATE TABLE "TEST_RESULTS" ("test_result_id" varchar PRIMARY KEY NOT NULL, "name" varchar NOT NULL, "start_timestamp" integer NOT NULL, "initial_url" varchar NOT NULL, "last_update_timestamp" integer NOT NULL, "testing_time" integer NOT NULL, "parent_test_result_id" varchar)`);
        await queryRunner.query(`INSERT INTO "TEST_RESULTS"("test_result_id", "name", "start_timestamp", "initial_url", "last_update_timestamp", "testing_time", "parent_test_result_id") SELECT "test_result_id", "name", "start_timestamp", "initial_url", "last_update_timestamp", "testing_time", "parent_test_result_id" FROM "temporary_TEST_RESULTS"`);
        await queryRunner.query(`DROP TABLE "temporary_TEST_RESULTS"`);
        await queryRunner.query(`ALTER TABLE "TEST_STEPS" RENAME TO "temporary_TEST_STEPS"`);
        await queryRunner.query(`CREATE TABLE "TEST_STEPS" ("test_step_id" varchar PRIMARY KEY NOT NULL, "window_handle" varchar NOT NULL, "page_title" varchar NOT NULL, "page_url" varchar NOT NULL, "keyword_texts" varchar NOT NULL, "operation_type" varchar NOT NULL, "operation_input" varchar NOT NULL, "operation_element" varchar NOT NULL, "input_elements" varchar NOT NULL, "timestamp" integer NOT NULL, "test_result_id" varchar, "test_purpose_id" varchar, "screenshot_id" varchar, "is_automatic" boolean DEFAULT (0), "scroll_position_x" integer, "scroll_position_y" integer, "client_size_width" integer, "client_size_height" integer, CONSTRAINT "REL_acf57d8cfbc3f63ebe7f0025aa" UNIQUE ("screenshot_id"), CONSTRAINT "FK_acf57d8cfbc3f63ebe7f0025aaa" FOREIGN KEY ("screenshot_id") REFERENCES "SCREENSHOTS" ("screenshot_id") ON DELETE NO ACTION ON UPDATE NO ACTION, CONSTRAINT "FK_bab22801448374f96a6828ccdb5" FOREIGN KEY ("test_purpose_id") REFERENCES "TEST_PURPOSES" ("test_purpose_id") ON DELETE SET NULL ON UPDATE NO ACTION, CONSTRAINT "FK_0bda1e0c86ad076da5e175a4d95" FOREIGN KEY ("test_result_id") REFERENCES "TEST_RESULTS" ("test_result_id") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "TEST_STEPS"("test_step_id", "window_handle", "page_title", "page_url", "keyword_texts", "operation_type", "operation_input", "operation_element", "input_elements", "timestamp", "test_result_id", "test_purpose_id", "screenshot_id", "is_automatic", "scroll_position_x", "scroll_position_y", "client_size_width", "client_size_height") SELECT "test_step_id", "window_handle", "page_title", "page_url", "keyword_texts", "operation_type", "operation_input", "operation_element", "input_elements", "timestamp", "test_result_id", "test_purpose_id", "screenshot_id", "is_automatic", "scroll_position_x", "scroll_position_y", "client_size_width", "client_size_height" FROM "temporary_TEST_STEPS"`);
        await queryRunner.query(`DROP TABLE "temporary_TEST_STEPS"`);
        await queryRunner.query(`ALTER TABLE "NOTES" RENAME TO "temporary_NOTES"`);
        await queryRunner.query(`CREATE TABLE "NOTES" ("note_id" varchar PRIMARY KEY NOT NULL, "value" varchar NOT NULL, "details" varchar NOT NULL, "timestamp" integer NOT NULL, "test_result_id" varchar, "screenshot_id" varchar, CONSTRAINT "REL_0ffc136baa8c5b3beebd750481" UNIQUE ("screenshot_id"), CONSTRAINT "FK_0ffc136baa8c5b3beebd7504818" FOREIGN KEY ("screenshot_id") REFERENCES "SCREENSHOTS" ("screenshot_id") ON DELETE NO ACTION ON UPDATE NO ACTION, CONSTRAINT "FK_4868666b7bd48904f09ea21d4db" FOREIGN KEY ("test_result_id") REFERENCES "TEST_RESULTS" ("test_result_id") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "NOTES"("note_id", "value", "details", "timestamp", "test_result_id", "screenshot_id") SELECT "note_id", "value", "details", "timestamp", "test_result_id", "screenshot_id" FROM "temporary_NOTES"`);
        await queryRunner.query(`DROP TABLE "temporary_NOTES"`);
        await queryRunner.query(`DROP TABLE "VIDEO"`);
    }

}
