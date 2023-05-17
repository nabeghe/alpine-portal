import Portal from "./Portal";

/**
 * List of portals... Currently not in use.
 *
 * @since 0.1.0
 * @type {Portal[]}
 */
const portals = [];

export default function (Alpine) {
    Alpine.directive('portal', (el, {value, expression}, {evaluate}) => {
        // Defining a portal object on the element itself.
        if (!value && el._x_portal === undefined) {
            el._x_portal = new Portal(el);
            portals.push(el._x_portal);
        }

        // If there is no value for the expression, ignore it.
        if (expression === false) return;

        // If the directive value is not present, it is in the process of setting the target property of the portal.
        if (!value) {
            value = 'target';
        }//
        // If the value is provided for the directive, that value is the name of a portal property, and the expression must also be evaluated.
        else {
            expression = evaluate(expression);
        }

        // Set the property for the portal.
        el._x_portal[value] = expression;
    });
};