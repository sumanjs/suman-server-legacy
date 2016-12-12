'use strict';

// http://tylermcginnis.com/reactjs-tutorial-a-comprehensive-guide-to-building-apps-with-react/


var $ = require('jquery');
var React = require('react');
var ReactDOM = require('react-dom');

var ReactController = require('../../react-components/react-controller');
var Accordion = require('../../react-components/AccordionComp');
var AccordionSection = require('../../react-components/AccordionSection');
var TestFileSuite = require('../../react-components/TestFileSuite');

// ReactDOM.render(React.createElement(Accordion, null),
// document.getElementById('react-main-mount'));

document.addEventListener('DOMContentLoaded', function () {
    ReactController(Accordion, { selected: "2" }, AccordionSection, window.childData, 'react-main-mount');
});