// http://tylermcginnis.com/reactjs-tutorial-a-comprehensive-guide-to-building-apps-with-react/


const $ = require('jquery');
const React = require('react');
const ReactDOM = require('react-dom');

const ReactController = require('../../react-components/react-controller');
const Accordion = require('../../react-components/AccordionComp');
const AccordionSection = require('../../react-components/AccordionSection');
const TestFileSuite = require('../../react-components/TestFileSuite');


// ReactDOM.render(React.createElement(Accordion, null),
// document.getElementById('react-main-mount'));

document.addEventListener('DOMContentLoaded', function () {
    ReactController(Accordion, {selected: "2"},
        AccordionSection, window.childData, 'react-main-mount');
});



