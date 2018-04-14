'use strict';

require('mousetrap');

/**
 * Simple multimap class for internal use.
 */
class Multimap {
    constructor() {
        this.map = {};
    }

    /**
     * Add a key/value pair to this multimap. If the key is unknown, create
     * an array to hold all values associated with the key.
     * 
     * @param {*} key Key.
     * @param {*} value A value associated with the key.
     */
    put(key, value) {
        if (!this.map[key]) {
            this.map[key] = [];
        }
        this.map[key].push(value);
    }

    /**
     * Get the array of values associated with the supplied key.
     * 
     * @param {*} key Key.
     * @returns An array of values associated with this key, or undefined
     * if the key is unknown.
     */
    get(key) {
        return this.map[key];
    }

    /**
     * Remove the supplied value from the supplied key.
     * 
     * @param {*} key Key.
     * @param {*} value A value associated with the key.
     */
    remove(key, value) {
        const array = this.map[key];
        if (array) {
            const index = array.indexOf(value);
            if (index >= 0) {
                array.splice(index, 1);
            }
        }
    }
}

/**
 * This class provides a way to name actions associated with shortcut key
 * sequences that the Mousetrap API listens for, and register callbacks
 * for those actions. This means that shortcut key sequences can be
 * configured outside of the application, for example, in JSON files.
 * 
 * Usage:
 *   - Register actions and shortcut key sequences of interest at construction.
 *   - Register event handlers for actions using the addEventHandler() method.
 * 
 * @example
 * configuration:
 *     const actionKeyConfig = [
 *         { action: "zoom-in",   keys: "ctrl+="            },
 *         { action: "copy-text", keys: "command+c"         },
 *         { action: "quit",      keys: ["mod+q", "alt+q"]  }
 *     ];
 * 
 * usage:
 *     const actions = new KeyBindings(actionKeyConfig);
 *     actions.addEventHandler('zoom-in') {
 *         window.zetZoomLevel(zoomIn());
 *     }
 * 
 * Any number of actions may be configure, and each one will cause an event
 * to be delivered when a key sequence is detected, but only those actions
 * for which an event handler is registered will be sent to the application.
 * 
 * This class uses the Mousetrap API to listen for shortcut key sequences.
 * See https://www.npmjs.com/package/mousetrap.
 * 
 * @author Shay Gordon
 */
class KeyBindings {
    /**
     * Setup key bindings for all configured shortcut key sequences and
     * actions. Applications using this module will only be notified of
     * those shortcut key events for which an event handler was added.
     * 
     * @param {Array} bindings The array of bindings between actions and
     * shortcut key sequences and actions.
     */
    constructor(bindings) {
        /**
         * A map of all event handlers registered to handle named actions
         * associated with shortcut key bindings registered with the
         * Mousetrap API.
         */
        this.eventHandlers = new Multimap();

        /**
         * An array of named actions and the shortcut key bindings that
         * they are associated with.
         */
        this.bindings = bindings;
        
        bindings.forEach(e => {
            Mousetrap.bind(e.keys, () => handle(e.action, this.eventHandlers));
        });

        /**
         * Internal event handler calls all registered handlers of an event.
         * 
         * @param {*} action Action.
         * @param {function[]} handlers Array of shortcut key event handlers.  
         */
        function handle(action, handlers) {
            handlers.get(action).forEach(handler => {
                return handler(action);
            });
        }
    }
 
    /**
     * Register an event handler that will be called when the named shortcut
     * key sequence is entered by a user. Internally, the event handler is
     * associated with the shortcut key sequence assigned to the sequence name;
     * when the shortcut key sequence is detected, the event handler is called
     * with the key sequence name as its only parameter. Multiple event handlers
     * may be registered for the same named sequence.
     * 
     * @param {*} action The name of an action associated with a shortcut key
     * sequence.
     * @param {*} eventHandler The function to call when the shortcut key
     * sequence is detected.
     * @throws An exception is thrown if the supplied event handler is not of
     * type 'Function'.
     */
    addEventHandler(action, eventHandler) {
        if (typeof eventHandler !== 'function') {
            throw eventHandler + ' is not a function'
        }
        this.eventHandlers.put(action, eventHandler);
    }

    /**
     * Remove an event handler that was registered to handle the named shortcut
     * key sequence.
     * 
     * @param {*} action The name of an action associated with a shortcut key
     * sequence.
     * @param {*} eventHandler The function called when the shortcut key
     * sequence is detected.
     */
    removeShortcutHandler(action, eventHandler) {
        this.eventHandlers.remove(action, eventHandler);
    }

    /**
     * Return the set of event handlers registered to handle the named shortcut
     * key sequence.
     * 
     * @param {*} action The name of an action associated with a shortcut key
     * sequence.
     * @returns The set set of event handlers registered to handle the shortcut
     * key sequence.
     */
    shortcutHandlers(action) {
        return this.eventHandlers.get(action);
    }
}

module.exports = { KeyBindings, KeyBindingsHelper }
