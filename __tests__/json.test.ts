import { extractJsonStringFromPostfix } from "../src/json";

test("extract", () => {
    const stdout = `Fetching https://github.com/ReactiveX/RxSwift.git
Completed resolution in 6.76s
Cloning https://github.com/ReactiveX/RxSwift.git
Resolving https://github.com/ReactiveX/RxSwift.git at 4.5.0
{
  "name": "swiftpm-update-check-action-example",
  "url": "/Users/runner/runners/2.158.0/work/swiftpm-update-check-action-example/swiftpm-update-check-action-example",
  "version": "unspecified",
  "path": "/Users/runner/runners/2.158.0/work/swiftpm-update-check-action-example/swiftpm-update-check-action-example",
  "dependencies": [
    {
      "name": "RxSwift",
      "url": "https://github.com/ReactiveX/RxSwift.git",
      "version": "4.5.0",
      "path": "/Users/runner/runners/2.158.0/work/swiftpm-update-check-action-example/swiftpm-update-check-action-example/.build/checkouts/RxSwift",
      "dependencies": [

      ]
    }
  ]
}`

    JSON.parse(extractJsonStringFromPostfix(stdout));
})