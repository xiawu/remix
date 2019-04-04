const async = require('async')
const Web3 = require('newchain-web3')
const assert = require('assert')

let Compiler = require('../src/compiler.js')
let Deployer = require('../src/deployer.js')
let TestRunner = require('../src/testRunner.js')
const Provider = require('newstudio-simulator').Provider

function compileAndDeploy (filename, callback) {
  let web3 = new Web3()
  web3.setProvider(new Provider())
  let compilationData
  let accounts
  async.waterfall([
    function getAccountList (next) {
      web3.eth.getAccounts((_err, _accounts) => {
        accounts = _accounts
        next(_err)
      })
    },
    function compile (next) {
      Compiler.compileFileOrFiles(filename, false, {accounts}, next)
    },
    function deployAllContracts (compilationResult, next) {
      compilationData = compilationResult
      Deployer.deployAll(compilationResult, web3, next)
    }
  ], function (_err, contracts) {
    callback(null, compilationData, contracts, accounts)
  })
}


describe('testRunner', function () {
  describe('#runTest', function() {
    describe('test with beforeAll', function () {
      let filename = 'tests/examples_1/simple_storage_test.sol'
      let tests = [], results = {}

      before(function (done) {
        compileAndDeploy(filename, function (_err, compilationData, contracts, accounts) {
          var testCallback = function (test) {
            tests.push(test)
          }
          var resultsCallback = function (_err, _results) {
            results = _results
            done()
          }
          TestRunner.runTest('MyTest', contracts.MyTest, compilationData[filename]['MyTest'], { accounts }, testCallback, resultsCallback)
        })
      })

      it('should 1 passing test', function () {
        assert.equal(results.passingNum, 2)
      })

      it('should 1 failing test', function () {
        assert.equal(results.failureNum, 2)
      })

      it('should returns 5 messages', function () {
        assert.deepEqual(tests, [
          { type: 'contract',    value: 'MyTest', filename: 'tests/examples_1/simple_storage_test.sol' },
          { type: 'testFailure', value: 'Should trigger one fail', time: 1, context: 'MyTest', errMsg: 'the test 1 fails' },
          { type: 'testPass',    value: 'Should trigger one pass', time: 1, context: 'MyTest'},
          { type: 'testPass',    value: 'Initial value should be100', time: 1, context: 'MyTest' },
          { type: 'testFailure', value: 'Initial value should be200', time: 1, context: 'MyTest', errMsg: 'function returned false' }
        ])
      })
    })

    describe('test with beforeEach', function () {
      let filename = 'tests/examples_2/simple_storage_test.sol'
      let tests = [], results = {}

      before(function (done) {
        compileAndDeploy(filename, function (_err, compilationData, contracts, accounts) {
          var testCallback = function (test) {
            tests.push(test)
          }
          var resultsCallback = function (_err, _results) {
            results = _results
            done()
          }
          TestRunner.runTest('MyTest', contracts.MyTest, compilationData[filename]['MyTest'], { accounts }, testCallback, resultsCallback)
        })
      })

      it('should 2 passing tests', function () {
        assert.equal(results.passingNum, 2)
      })

      it('should 0 failing tests', function () {
        assert.equal(results.failureNum, 0)
      })

      it('should returns 3 messages', function () {
        assert.deepEqual(tests, [
          { type: 'contract', value: 'MyTest', filename: 'tests/examples_2/simple_storage_test.sol' },
          { type: 'testPass', value: 'Initial value should be100', time: 1, context: 'MyTest' },
          { type: 'testPass', value: 'Initial value should be200', time: 1, context: 'MyTest' }
        ])
      })
    })

    // Test string equality
    describe('test string equality', function () {
      let filename = 'tests/examples_3/simple_string_test.sol'
      let tests = [], results = {}

      before(function (done) {
        compileAndDeploy(filename, function (_err, compilationData, contracts, accounts) {
          var testCallback = function (test) {
            tests.push(test)
          }
          var resultsCallback = function (_err, _results) {
            results = _results
            done()
          }
          TestRunner.runTest('StringTest', contracts.StringTest, compilationData[filename]['StringTest'], { accounts }, testCallback, resultsCallback)
          TestRunner.runTest('StringTest2', contracts.StringTest2, compilationData[filename]['StringTest2'], { accounts }, testCallback, resultsCallback)
        })
      })

      it('should 2 passing tests', function () {
        assert.equal(results.passingNum, 2)
      })

      it('should 1 failing tests', function () {
        assert.equal(results.failureNum, 1)
      })

      it('should returns 3 messages', function () {
        assert.deepEqual(tests, [
          { type: 'contract', value: 'StringTest', filename: 'tests/examples_3/simple_string_test.sol' },
          { type: 'testFailure', value: 'Value should be hello world', time: 1, context: 'StringTest', "errMsg": "initial value is not correct" },
          { type: 'testPass', value: 'Value should not be hello wordl', time: 1, context: 'StringTest' },
          { type: 'testPass', value: 'Initial value should be hello', time: 1, context: 'StringTest' },
        ])
      })
    })

    // Test signed/unsigned integer weight
    describe('test number weight', function () {
      let filename = 'tests/number/number_test.sol'
      let tests = [], results = {}

      before(function (done) {
        compileAndDeploy(filename, function (_err, compilationData, contracts, accounts) {
          var testCallback = function (test) {
            tests.push(test)
          }
          var resultsCallback = function (_err, _results) {
            results = _results
            done()
          }
          TestRunner.runTest('IntegerTest', contracts.IntegerTest, compilationData[filename]['IntegerTest'], { accounts }, testCallback, resultsCallback)
        })
      })

      it('should have 6 passing tests', function () {
        assert.equal(results.passingNum, 6)
      })
      it('should have 2 failing tests', function () {
        assert.equal(results.failureNum, 2)
      })
    })

    // Test Transaction with different sender
    describe('various sender', function () {
      let filename = 'tests/various_sender/sender_test.sol'
      let tests = [], results = {}

      before(function (done) {
        compileAndDeploy(filename, function (_err, compilationData, contracts, accounts) {
          var testCallback = function (test) {
            tests.push(test)
          }
          var resultsCallback = function (_err, _results) {
            results = _results
            done()
          }

          TestRunner.runTest('SenderTest', contracts.SenderTest, compilationData[filename]['SenderTest'], { accounts }, testCallback, resultsCallback)

        })
      })

        it('should have 4 passing tests', function () {
          assert.equal(results.passingNum, 4)
      })
      it('should have 1 failing tests', function () {
        assert.equal(results.failureNum, 0)
      })
    })
  })
})
