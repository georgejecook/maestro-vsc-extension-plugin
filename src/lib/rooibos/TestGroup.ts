import { Annotation } from './Annotation';
import { getSessionInfo } from './RooibosSessionInfo';
import { TestCase } from './TestCase';
import { TestBlock, TestSuite } from './TestSuite';

export class TestGroup extends TestBlock {

  constructor(testSuite: TestSuite, annotation: Annotation) {
    super(annotation);
    this.testSuite = testSuite;
    this.setupFunctionName = this.setupFunctionName || this.testSuite.setupFunctionName;
    this.tearDownFunctionName = this.tearDownFunctionName || this.testSuite.tearDownFunctionName;
    this.beforeEachFunctionName = this.beforeEachFunctionName || this.testSuite.beforeEachFunctionName;
    this.afterEachFunctionName = this.afterEachFunctionName || this.testSuite.afterEachFunctionName;
  }

  public testSuite: TestSuite;
  public testCases: TestCase[] = [];
  public ignoredTestCases: TestCase[] = [];
  public soloTestCases: TestCase[] = [];

  public addTestCase(testCase: TestCase) {
    this.testCases.push(testCase);
    const sessionInfo = getSessionInfo();

    if (testCase.isIgnored) {
      this.ignoredTestCases.push(testCase);
    } else if (testCase.isSolo) {
      this.hasSoloTests = true;
      this.soloTestCases.push(testCase);
    }
    this.testCases.push(testCase);
  }

  public asJson(): object {
    return {
      pkgPath: this.pkgPath,
      setupFunctionName: this.setupFunctionName,
      tearDownFunctionName: this.tearDownFunctionName,
      beforeEachFunctionName: this.beforeEachFunctionName,
      afterEachFunctionName: this.afterEachFunctionName,
      isSolo: this.isSolo,
      isIgnored: this.isIgnored,
      name: this.name
    };
  }

  public asText(): string {
    let testCaseText = this.testCases.filter((tc) => tc.isIncluded).map((tc) => tc.asText());

    return `
      {
        testCases: [${testCaseText.join(',\n')}]
        filename: "${this.pkgPath}"
        setupFunctionName: "${this.setupFunctionName || ''}"
        tearDownFunctionName: "${this.tearDownFunctionName || ''}"
        beforeEachFunctionName: "${this.beforeEachFunctionName || ''}"
        afterEachFunctionName: "${this.afterEachFunctionName || ''}"
        isSolo: ${this.isSolo}
        isIgnored: ${this.isIgnored}
        name: "${this.name || ''}"
      }`;
  }

}