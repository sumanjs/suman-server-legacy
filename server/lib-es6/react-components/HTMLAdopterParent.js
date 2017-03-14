/**
 * Created by denmanm1 on 3/30/16.
 */


const React = require('react');


module.exports = function (children) {

    return React.createClass({

        renderChildren: function () {

            return children.map(function (item) {

                let Comp = item.comp;
                let props = item.props;

                return (
                    <div>
                        <Comp {...props}/>
                    </div>
                )
            });

        },

        render: function () {

            return (

                <html lang="en">
                <head>
                    <meta charSet="UTF-8"></meta>
                    <title>Title</title>

                </head>
                <body>

                <div>
                    {this.renderChildren()}
                </div>

                </body>
                </html>

            )

        }

    });
};