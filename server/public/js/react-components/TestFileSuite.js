define(function (require, exports, module) {'use strict';

  let _stringify2 = JSON.stringify;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Created by denmanm1 on 3/30/16.
 */

let React = require('react');
let _ = require('lodash');

module.exports = React.createClass({
    displayName: 'exports',


    findChildren: function findChildren(ids) {
        return this.props.data.filter(function (item) {
            return _.includes(ids, item.testId);
        });
    },

    formatTestCases: function formatTestCases(items) {
        let testCases = items.map(function (tests) {
            return React.createElement(
                'li',
                { className: 'testResults' },
                'Test Description: ',
                React.createElement(
                    'span',
                    { className: 'items' },
                    tests.desc
                ),
                ', Completed: ',
                tests.complete ? React.createElement(
                    'span',
                    { className: 'items', id: 'tick' },
                    '✓'
                ) : React.createElement(
                    'span',
                    { className: 'items', id: 'cross' },
                    '✗'
                ),
                ', Type: ',
                React.createElement(
                    'span',
                    { className: 'items' },
                    tests.type
                ),
                ', Test error: ',
                !tests.error ? React.createElement(
                    'span',
                    { className: 'items' },
                    '(null)'
                ) : React.createElement(
                    'span',
                    { className: 'items', id: 'errors' },
                    tests.error
                ),
                ', Timeout: ',
                React.createElement(
                    'span',
                    { className: 'items' },
                    tests.timeout
                ),
                ', DateStarted: ',
                React.createElement(
                    'span',
                    { className: 'items' },
                    tests.dateStarted
                ),
                ', DateComplete: ',
                React.createElement(
                    'span',
                    { className: 'items' },
                    tests.dateComplete
                ),
                'Total time: ',
                React.createElement(
                    'span',
                    { className: 'items' },
                    tests.dateComplete - tests.dateStarted
                )
            );
        }.bind(this));

        return React.createElement(
            'ul',
            null,
            testCases
        );
    },
    testCases: function testCases(item) {
        if (item.length === 0) {
            return React.createElement(
                'div',
                { className: 'no-tests' },
                'Test Cases not defined'
            );
        } else {
            return React.createElement(
                'div',
                null,
                this.formatTestCases(item)
            );
        }
    },

    recurse: function recurse(item) {
        let _this = this;

        let children = this.findChildren(item.children.map(function (child) {
            return child.testId;
        }));

        return React.createElement(
            'div',
            { className: 'describe' },
            React.createElement(
                'ul',
                null,
                React.createElement(
                    'li',
                    { className: 'descriptionName' },
                    React.createElement(
                        'label',
                        null,
                        'Description: \'',
                        item.desc,
                        '\', options: ',
                        (0, _stringify2)(item.opts)
                    )
                ),
                item.tests.length > 0 ? React.createElement(
                    'div',
                    { className: 'test-cases' },
                    'Test Cases:',
                    this.testCases(item.tests)
                ) : null,
                React.createElement(
                    'div',
                    { className: 'suite-children' },
                    children.map(function (child) {
                        return _this.recurse(child);
                    })
                )
            )
        );
    },

    getDescribes: function getDescribes() {
        console.log('data:', this.props.data);
        if (this.props.data && this.props.data[0]) {
            return this.recurse(this.props.data[0]);
        } else {
            return React.createElement(
                'div',
                null,
                'Insert spinner here'
            );
        }
    },

    render: function render() {
        return React.createElement(
            'div',
            { className: 'accordion-item' },
            this.getDescribes()
        );
    }

});
});
