'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var utils = require('./utils');
var Drag = require('./drag');
var Pinch = require('./pinch');
var Clamp = require('./clamp');
var ClampZoom = require('./clamp-zoom');
var Decelerate = require('./decelerate');
var Bounce = require('./bounce');
var Snap = require('./snap');
var SnapZoom = require('./snap-zoom');
var Follow = require('./follow');
var Wheel = require('./wheel');
var MouseEdges = require('./mouse-edges');

var PLUGIN_ORDER = ['drag', 'pinch', 'wheel', 'follow', 'mouse-edges', 'decelerate', 'bounce', 'snap-zoom', 'clamp-zoom', 'snap', 'clamp'];

var Viewport = function (_PIXI$Container) {
    _inherits(Viewport, _PIXI$Container);

    /**
     * @extends PIXI.Container
     * @extends EventEmitter
     * @param {object} [options]
     * @param {number} [options.screenWidth=window.innerWidth]
     * @param {number} [options.screenHeight=window.innerHeight]
     * @param {number} [options.worldWidth=this.width]
     * @param {number} [options.worldHeight=this.height]
     * @param {number} [options.threshold = 5] number of pixels to move to trigger an input event (e.g., drag, pinch) or disable a clicked event
     * @param {(PIXI.Rectangle|PIXI.Circle|PIXI.Ellipse|PIXI.Polygon|PIXI.RoundedRectangle)} [options.forceHitArea] change the default hitArea from world size to a new value
     * @param {PIXI.ticker.Ticker} [options.ticker=PIXI.ticker.shared] use this PIXI.ticker for updates
     * @param {PIXI.InteractionManager} [options.interaction=null] InteractionManager, available from instantiated WebGLRenderer/CanvasRenderer.plugins.interaction - used to calculate pointer postion relative to canvas location on screen
     * @param {HTMLElement} [options.divWheel=document.body] div to attach the wheel event
     * @fires clicked
     * @fires drag-start
     * @fires drag-end
     * @fires drag-remove
     * @fires pinch-start
     * @fires pinch-end
     * @fires pinch-remove
     * @fires snap-start
     * @fires snap-end
     * @fires snap-remove
     * @fires snap-zoom-start
     * @fires snap-zoom-end
     * @fires snap-zoom-remove
     * @fires bounce-x-start
     * @fires bounce-x-end
     * @fires bounce-y-start
     * @fires bounce-y-end
     * @fires bounce-remove
     * @fires wheel
     * @fires wheel-remove
     * @fires wheel-scroll
     * @fires wheel-scroll-remove
     * @fires mouse-edge-start
     * @fires mouse-edge-end
     * @fires mouse-edge-remove
     * @fires moved
     */
    function Viewport(options) {
        _classCallCheck(this, Viewport);

        options = options || {};

        var _this = _possibleConstructorReturn(this, (Viewport.__proto__ || Object.getPrototypeOf(Viewport)).call(this));

        _this.plugins = {};
        _this.pluginsList = [];
        _this._screenWidth = options.screenWidth;
        _this._screenHeight = options.screenHeight;
        _this._worldWidth = options.worldWidth;
        _this._worldHeight = options.worldHeight;
        _this.hitAreaFullScreen = utils.defaults(options.hitAreaFullScreen, true);
        _this.forceHitArea = options.forceHitArea;
        _this.threshold = utils.defaults(options.threshold, 5);
        _this.interaction = options.interaction || null;
        _this.div = options.divWheel || document.body;
        _this.listeners(_this.div);

        /**
         * active touch point ids on the viewport
         * @type {number[]}
         * @readonly
         */
        _this.touches = [];

        _this.ticker = options.ticker || PIXI.ticker.shared;
        _this.tickerFunction = function () {
            return _this.update();
        };
        _this.ticker.add(_this.tickerFunction);
        return _this;
    }

    /**
     * removes all event listeners from viewport
     * (useful for cleanup of wheel and ticker events when removing viewport)
     */


    _createClass(Viewport, [{
        key: 'removeListeners',
        value: function removeListeners() {
            this.ticker.remove(this.tickerFunction);
            this.div.removeEventListener('wheel', this.wheelFunction);
        }

        /**
         * overrides PIXI.Container's destroy to also remove the 'wheel' and PIXI.Ticker listeners
         */

    }, {
        key: 'destroy',
        value: function destroy(options) {
            _get(Viewport.prototype.__proto__ || Object.getPrototypeOf(Viewport.prototype), 'destroy', this).call(this, options);
            this.removeListeners();
        }

        /**
         * update animations
         * @private
         */

    }, {
        key: 'update',
        value: function update() {
            if (!this.pause) {
                var _iteratorNormalCompletion = true;
                var _didIteratorError = false;
                var _iteratorError = undefined;

                try {
                    for (var _iterator = this.pluginsList[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                        var plugin = _step.value;

                        plugin.update(this.ticker.elapsedMS);
                    }
                } catch (err) {
                    _didIteratorError = true;
                    _iteratorError = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion && _iterator.return) {
                            _iterator.return();
                        }
                    } finally {
                        if (_didIteratorError) {
                            throw _iteratorError;
                        }
                    }
                }
            }
            if (!this.forceHitArea) {
                this.hitArea.x = this.left;
                this.hitArea.y = this.top;
                this.hitArea.width = this.worldScreenWidth;
                this.hitArea.height = this.worldScreenHeight;
            }
        }

        /**
         * use this to set screen and world sizes--needed for pinch/wheel/clamp/bounce
         * @param {number} screenWidth
         * @param {number} screenHeight
         * @param {number} [worldWidth]
         * @param {number} [worldHeight]
         */

    }, {
        key: 'resize',
        value: function resize(screenWidth, screenHeight, worldWidth, worldHeight) {
            this._screenWidth = screenWidth || window.innerWidth;
            this._screenHeight = screenHeight || window.innerHeight;
            this._worldWidth = worldWidth;
            this._worldHeight = worldHeight;
            this.resizePlugins();
        }

        /**
         * called after a worldWidth/Height change
         * @private
         */

    }, {
        key: 'resizePlugins',
        value: function resizePlugins() {
            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
                for (var _iterator2 = this.pluginsList[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                    var plugin = _step2.value;

                    plugin.resize();
                }
            } catch (err) {
                _didIteratorError2 = true;
                _iteratorError2 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion2 && _iterator2.return) {
                        _iterator2.return();
                    }
                } finally {
                    if (_didIteratorError2) {
                        throw _iteratorError2;
                    }
                }
            }
        }

        /**
         * screen width in screen pixels
         * @type {number}
         */

    }, {
        key: 'listeners',


        /**
         * add input listeners
         * @private
         */
        value: function listeners(div) {
            var _this2 = this;

            this.interactive = true;
            if (!this.forceHitArea) {
                this.hitArea = new PIXI.Rectangle(0, 0, this.worldWidth, this.worldHeight);
            }
            this.on('pointerdown', this.down);
            this.on('pointermove', this.move);
            this.on('pointerup', this.up);
            this.on('pointerupoutside', this.up);
            this.on('pointercancel', this.up);
            this.on('pointerout', this.up);
            this.wheelFunction = function (e) {
                return _this2.handleWheel(e);
            };
            div.addEventListener('wheel', this.wheelFunction);
            this.leftDown = false;
        }

        /**
         * handle down events
         * @private
         */

    }, {
        key: 'down',
        value: function down(e) {
            if (this.pause) {
                return;
            }
            if (e.data.pointerType === 'mouse') {
                if (e.data.originalEvent.button == 0) {
                    this.leftDown = true;
                }
            } else {
                this.touches.push(e.data.pointerId);
            }

            if (this.countDownPointers() === 1) {
                this.last = { x: e.data.global.x, y: e.data.global.y

                    // clicked event does not fire if viewport is decelerating or bouncing
                };var decelerate = this.plugins['decelerate'];
                var bounce = this.plugins['bounce'];
                if ((!decelerate || Math.abs(decelerate.x) < this.threshold && Math.abs(decelerate.y) < this.threshold) && (!bounce || !bounce.toX && !bounce.toY)) {
                    this.clickedAvailable = true;
                } else {
                    this.clickedAvailable = false;
                }
            } else {
                this.clickedAvailable = false;
            }

            var _iteratorNormalCompletion3 = true;
            var _didIteratorError3 = false;
            var _iteratorError3 = undefined;

            try {
                for (var _iterator3 = this.pluginsList[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                    var plugin = _step3.value;

                    plugin.down(e);
                }
            } catch (err) {
                _didIteratorError3 = true;
                _iteratorError3 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion3 && _iterator3.return) {
                        _iterator3.return();
                    }
                } finally {
                    if (_didIteratorError3) {
                        throw _iteratorError3;
                    }
                }
            }
        }

        /**
         * whether change exceeds threshold
         * @private
         * @param {number} change
         */

    }, {
        key: 'checkThreshold',
        value: function checkThreshold(change) {
            if (Math.abs(change) >= this.threshold) {
                return true;
            }
            return false;
        }

        /**
         * handle move events
         * @private
         */

    }, {
        key: 'move',
        value: function move(e) {
            if (this.pause) {
                return;
            }

            var _iteratorNormalCompletion4 = true;
            var _didIteratorError4 = false;
            var _iteratorError4 = undefined;

            try {
                for (var _iterator4 = this.pluginsList[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                    var plugin = _step4.value;

                    plugin.move(e);
                }
            } catch (err) {
                _didIteratorError4 = true;
                _iteratorError4 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion4 && _iterator4.return) {
                        _iterator4.return();
                    }
                } finally {
                    if (_didIteratorError4) {
                        throw _iteratorError4;
                    }
                }
            }

            if (this.clickedAvailable) {
                var distX = e.data.global.x - this.last.x;
                var distY = e.data.global.y - this.last.y;
                if (this.checkThreshold(distX) || this.checkThreshold(distY)) {
                    this.clickedAvailable = false;
                }
            }
        }

        /**
         * handle up events
         * @private
         */

    }, {
        key: 'up',
        value: function up(e) {
            if (this.pause) {
                return;
            }

            if (e.data.originalEvent instanceof MouseEvent && e.data.originalEvent.button == 0) {
                this.leftDown = false;
            }

            if (e.data.pointerType !== 'mouse') {
                for (var i = 0; i < this.touches.length; i++) {
                    if (this.touches[i] === e.data.pointerId) {
                        this.touches.splice(i, 1);
                        break;
                    }
                }
            }

            var _iteratorNormalCompletion5 = true;
            var _didIteratorError5 = false;
            var _iteratorError5 = undefined;

            try {
                for (var _iterator5 = this.pluginsList[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
                    var plugin = _step5.value;

                    plugin.up(e);
                }
            } catch (err) {
                _didIteratorError5 = true;
                _iteratorError5 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion5 && _iterator5.return) {
                        _iterator5.return();
                    }
                } finally {
                    if (_didIteratorError5) {
                        throw _iteratorError5;
                    }
                }
            }

            if (this.clickedAvailable && this.countDownPointers() === 0) {
                this.emit('clicked', { screen: this.last, world: this.toWorld(this.last), viewport: this });
                this.clickedAvailable = false;
            }
        }

        /**
         * gets pointer position if this.interaction is set
         * @param {UIEvent} evt
         * @private
         */

    }, {
        key: 'getPointerPosition',
        value: function getPointerPosition(evt) {
            var point = new PIXI.Point();
            if (this.interaction) {
                this.interaction.mapPositionToPoint(point, evt.clientX, evt.clientY);
            } else {
                point.x = evt.clientX;
                point.y = evt.clientY;
            }
            return point;
        }

        /**
         * handle wheel events
         * @private
         */

    }, {
        key: 'handleWheel',
        value: function handleWheel(e) {
            if (this.pause) {
                return;
            }

            // only handle wheel events where the mouse is over the viewport
            var point = this.toLocal(this.getPointerPosition(e));
            if (this.left <= point.x && point.x <= this.right && this.top <= point.y && point.y <= this.bottom) {
                var result = void 0;
                var _iteratorNormalCompletion6 = true;
                var _didIteratorError6 = false;
                var _iteratorError6 = undefined;

                try {
                    for (var _iterator6 = this.pluginsList[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
                        var plugin = _step6.value;

                        if (plugin.wheel(e)) {
                            result = true;
                        }
                    }
                } catch (err) {
                    _didIteratorError6 = true;
                    _iteratorError6 = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion6 && _iterator6.return) {
                            _iterator6.return();
                        }
                    } finally {
                        if (_didIteratorError6) {
                            throw _iteratorError6;
                        }
                    }
                }

                return result;
            }
        }

        /**
         * change coordinates from screen to world
         * @param {number|PIXI.Point} x
         * @param {number} [y]
         * @returns {PIXI.Point}
         */

    }, {
        key: 'toWorld',
        value: function toWorld() {
            if (arguments.length === 2) {
                var x = arguments[0];
                var y = arguments[1];
                return this.toLocal({ x: x, y: y });
            } else {
                return this.toLocal(arguments[0]);
            }
        }

        /**
         * change coordinates from world to screen
         * @param {number|PIXI.Point} x
         * @param {number} [y]
         * @returns {PIXI.Point}
         */

    }, {
        key: 'toScreen',
        value: function toScreen() {
            if (arguments.length === 2) {
                var x = arguments[0];
                var y = arguments[1];
                return this.toGlobal({ x: x, y: y });
            } else {
                var point = arguments[0];
                return this.toGlobal(point);
            }
        }

        /**
         * screen width in world coordinates
         * @type {number}
         * @readonly
         */

    }, {
        key: 'moveCenter',


        /**
         * move center of viewport to point
         * @param {(number|PIXI.PointLike)} x or point
         * @param {number} [y]
         * @return {Viewport} this
         */
        value: function moveCenter() /*x, y | PIXI.Point*/{
            var x = void 0,
                y = void 0;
            if (!isNaN(arguments[0])) {
                x = arguments[0];
                y = arguments[1];
            } else {
                x = arguments[0].x;
                y = arguments[0].y;
            }
            this.position.set((this.worldScreenWidth / 2 - x) * this.scale.x, (this.worldScreenHeight / 2 - y) * this.scale.y);
            this._reset();
            return this;
        }

        /**
         * top-left corner
         * @type {PIXI.PointLike}
         */

    }, {
        key: 'moveCorner',


        /**
         * move viewport's top-left corner; also clamps and resets decelerate and bounce (as needed)
         * @param {number|PIXI.Point} x|point
         * @param {number} y
         * @return {Viewport} this
         */
        value: function moveCorner() /*x, y | point*/{
            if (arguments.length === 1) {
                this.position.set(-arguments[0].x * this.scale.x, -arguments[0].y * this.scale.y);
            } else {
                this.position.set(-arguments[0] * this.scale.x, -arguments[1] * this.scale.y);
            }
            this._reset();
            return this;
        }

        /**
         * change zoom so the width fits in the viewport
         * @param {number} [width=this._worldWidth] in world coordinates
         * @param {boolean} [center] maintain the same center
         * @param {boolean} [scaleY=true] whether to set scaleY=scaleX
         * @return {Viewport} this
         */

    }, {
        key: 'fitWidth',
        value: function fitWidth(width, center) {
            var scaleY = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;

            var save = void 0;
            if (center) {
                save = this.center;
            }
            width = width || this.worldWidth;
            this.scale.x = this.screenWidth / width;

            if (scaleY) {
                this.scale.y = this.scale.x;
            }

            if (center) {
                this.moveCenter(save);
            }
            return this;
        }

        /**
         * change zoom so the height fits in the viewport
         * @param {number} [height=this._worldHeight] in world coordinates
         * @param {boolean} [center] maintain the same center of the screen after zoom
         * @param { boolean } [scaleX=true] whether to set scaleX = scaleY
         * @return {Viewport} this
         */

    }, {
        key: 'fitHeight',
        value: function fitHeight(height, center) {
            var scaleX = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;

            var save = void 0;
            if (center) {
                save = this.center;
            }
            height = height || this.worldHeight;
            this.scale.y = this.screenHeight / height;

            if (scaleX) {
                this.scale.x = this.scale.y;
            }

            if (center) {
                this.moveCenter(save);
            }
            return this;
        }

        /**
         * change zoom so it fits the entire world in the viewport
         * @param {boolean} [center] maintain the same center of the screen after zoom
         * @return {Viewport} this
         */

    }, {
        key: 'fitWorld',
        value: function fitWorld(center) {
            var save = void 0;
            if (center) {
                save = this.center;
            }
            this.scale.x = this._screenWidth / this._worldWidth;
            this.scale.y = this._screenHeight / this._worldHeight;
            if (this.scale.x < this.scale.y) {
                this.scale.y = this.scale.x;
            } else {
                this.scale.x = this.scale.y;
            }
            if (center) {
                this.moveCenter(save);
            }
            return this;
        }

        /**
         * change zoom so it fits the size or the entire world in the viewport
         * @param {boolean} [center] maintain the same center of the screen after zoom
         * @param {number} [width] desired width
         * @param {number} [height] desired height
         * @return {Viewport} this
         */

    }, {
        key: 'fit',
        value: function fit(center, width, height) {
            var save = void 0;
            if (center) {
                save = this.center;
            }
            width = width || this.worldWidth;
            height = height || this.worldHeight;
            this.scale.x = this.screenWidth / width;
            this.scale.y = this.screenHeight / height;
            if (this.scale.x < this.scale.y) {
                this.scale.y = this.scale.x;
            } else {
                this.scale.x = this.scale.y;
            }
            if (center) {
                this.moveCenter(save);
            }
            return this;
        }

        /**
         * zoom viewport by a certain percent (in both x and y direction)
         * @param {number} percent change (e.g., 0.25 would increase a starting scale of 1.0 to 1.25)
         * @param {boolean} [center] maintain the same center of the screen after zoom
         * @return {Viewport} the viewport
         */

    }, {
        key: 'zoomPercent',
        value: function zoomPercent(percent, center) {
            var save = void 0;
            if (center) {
                save = this.center;
            }
            var scale = this.scale.x + this.scale.x * percent;
            this.scale.set(scale);
            if (center) {
                this.moveCenter(save);
            }
            return this;
        }

        /**
         * zoom viewport by increasing/decreasing width by a certain number of pixels
         * @param {number} change in pixels
         * @param {boolean} [center] maintain the same center of the screen after zoom
         * @return {Viewport} the viewport
         */

    }, {
        key: 'zoom',
        value: function zoom(change, center) {
            this.fitWidth(change + this.worldScreenWidth, center);
            return this;
        }

        /**
         * @param {object} [options]
         * @param {number} [options.width] the desired width to snap (to maintain aspect ratio, choose only width or height)
         * @param {number} [options.height] the desired height to snap (to maintain aspect ratio, choose only width or height)
         * @param {number} [options.time=1000]
         * @param {string|function} [options.ease=easeInOutSine] ease function or name (see http://easings.net/ for supported names)
         * @param {PIXI.Point} [options.center] place this point at center during zoom instead of center of the viewport
         * @param {boolean} [options.interrupt=true] pause snapping with any user input on the viewport
         * @param {boolean} [options.removeOnComplete] removes this plugin after snapping is complete
         * @param {boolean} [options.removeOnInterrupt] removes this plugin if interrupted by any user input
         * @param {boolean} [options.forceStart] starts the snap immediately regardless of whether the viewport is at the desired zoom
         */

    }, {
        key: 'snapZoom',
        value: function snapZoom(options) {
            this.plugins['snap-zoom'] = new SnapZoom(this, options);
            this.pluginsSort();
            return this;
        }

        /**
         * @private
         * @typedef OutOfBounds
         * @type {object}
         * @property {boolean} left
         * @property {boolean} right
         * @property {boolean} top
         * @property {boolean} bottom
         */

        /**
         * is container out of world bounds
         * @return {OutOfBounds}
         * @private
         */

    }, {
        key: 'OOB',
        value: function OOB() {
            var result = {};
            result.left = this.left < 0;
            result.right = this.right > this._worldWidth;
            result.top = this.top < 0;
            result.bottom = this.bottom > this._worldHeight;
            result.cornerPoint = {
                x: this._worldWidth * this.scale.x - this._screenWidth,
                y: this._worldHeight * this.scale.y - this._screenHeight
            };
            return result;
        }

        /**
         * world coordinates of the right edge of the screen
         * @type {number}
         */

    }, {
        key: 'countDownPointers',


        /**
         * count of mouse/touch pointers that are down on the viewport
         * @private
         * @return {number}
         */
        value: function countDownPointers() {
            return (this.leftDown ? 1 : 0) + this.touches.length;
        }

        /**
         * array of touch pointers that are down on the viewport
         * @private
         * @return {PIXI.InteractionTrackingData[]}
         */

    }, {
        key: 'getTouchPointers',
        value: function getTouchPointers() {
            var results = [];
            var pointers = this.trackedPointers;
            for (var key in pointers) {
                var pointer = pointers[key];
                if (this.touches.indexOf(pointer.pointerId) !== -1) {
                    results.push(pointer);
                }
            }
            return results;
        }

        /**
         * array of pointers that are down on the viewport
         * @private
         * @return {PIXI.InteractionTrackingData[]}
         */

    }, {
        key: 'getPointers',
        value: function getPointers() {
            var results = [];
            var pointers = this.trackedPointers;
            for (var key in pointers) {
                results.push(pointers[key]);
            }
            return results;
        }

        /**
         * clamps and resets bounce and decelerate (as needed) after manually moving viewport
         * @private
         */

    }, {
        key: '_reset',
        value: function _reset() {
            if (this.plugins['bounce']) {
                this.plugins['bounce'].reset();
                this.plugins['bounce'].bounce();
            }
            if (this.plugins['decelerate']) {
                this.plugins['decelerate'].reset();
            }
            if (this.plugins['snap']) {
                this.plugins['snap'].reset();
            }
            if (this.plugins['clamp']) {
                this.plugins['clamp'].update();
            }
            if (this.plugins['clamp-zoom']) {
                this.plugins['clamp-zoom'].clamp();
            }
            this.dirty = true;
        }

        // PLUGINS

        /**
         * removes installed plugin
         * @param {string} type of plugin (e.g., 'drag', 'pinch')
         */

    }, {
        key: 'removePlugin',
        value: function removePlugin(type) {
            if (this.plugins[type]) {
                this.plugins[type] = null;
                this.emit(type + '-remove');
                this.pluginsSort();
            }
        }

        /**
         * pause plugin
         * @param {string} type of plugin (e.g., 'drag', 'pinch')
         */

    }, {
        key: 'pausePlugin',
        value: function pausePlugin(type) {
            if (this.plugins[type]) {
                this.plugins[type].pause();
            }
        }

        /**
         * resume plugin
         * @param {string} type of plugin (e.g., 'drag', 'pinch')
         */

    }, {
        key: 'resumePlugin',
        value: function resumePlugin(type) {
            if (this.plugins[type]) {
                this.plugins[type].resume();
            }
        }

        /**
         * sort plugins for updates
         * @private
         */

    }, {
        key: 'pluginsSort',
        value: function pluginsSort() {
            this.pluginsList = [];
            var _iteratorNormalCompletion7 = true;
            var _didIteratorError7 = false;
            var _iteratorError7 = undefined;

            try {
                for (var _iterator7 = PLUGIN_ORDER[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
                    var plugin = _step7.value;

                    if (this.plugins[plugin]) {
                        this.pluginsList.push(this.plugins[plugin]);
                    }
                }
            } catch (err) {
                _didIteratorError7 = true;
                _iteratorError7 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion7 && _iterator7.return) {
                        _iterator7.return();
                    }
                } finally {
                    if (_didIteratorError7) {
                        throw _iteratorError7;
                    }
                }
            }
        }

        /**
         * enable one-finger touch to drag
         * @param {object} [options]
         * @param {string} [options.direction=all] direction to drag (all, x, or y)
         * @param {boolean} [options.wheel=true] use wheel to scroll in y direction (unless wheel plugin is active)
         * @param {number} [options.wheelScroll=10] number of pixels to scroll with each wheel spin
         * @param {boolean} [options.reverse] reverse the direction of the wheel scroll
         * @param {string} [options.underflow=center] (top/bottom/center and left/right/center, or center) where to place world if too small for screen
         */

    }, {
        key: 'drag',
        value: function drag(options) {
            this.plugins['drag'] = new Drag(this, options);
            this.pluginsSort();
            return this;
        }

        /**
         * clamp to world boundaries or other provided boundaries
         * NOTES:
         *   clamp is disabled if called with no options; use { direction: 'all' } for all edge clamping
         *   screenWidth, screenHeight, worldWidth, and worldHeight needs to be set for this to work properly
         * @param {object} [options]
         * @param {(number|boolean)} [options.left] clamp left; true=0
         * @param {(number|boolean)} [options.right] clamp right; true=viewport.worldWidth
         * @param {(number|boolean)} [options.top] clamp top; true=0
         * @param {(number|boolean)} [options.bottom] clamp bottom; true=viewport.worldHeight
         * @param {string} [options.direction] (all, x, or y) using clamps of [0, viewport.worldWidth/viewport.worldHeight]; replaces left/right/top/bottom if set
         * @param {string} [options.underflow=center] (top/bottom/center and left/right/center, or center) where to place world if too small for screen
         * @return {Viewport} this
         */

    }, {
        key: 'clamp',
        value: function clamp(options) {
            this.plugins['clamp'] = new Clamp(this, options);
            this.pluginsSort();
            return this;
        }

        /**
         * decelerate after a move
         * @param {object} [options]
         * @param {number} [options.friction=0.95] percent to decelerate after movement
         * @param {number} [options.bounce=0.8] percent to decelerate when past boundaries (only applicable when viewport.bounce() is active)
         * @param {number} [options.minSpeed=0.01] minimum velocity before stopping/reversing acceleration
         * @return {Viewport} this
         */

    }, {
        key: 'decelerate',
        value: function decelerate(options) {
            this.plugins['decelerate'] = new Decelerate(this, options);
            this.pluginsSort();
            return this;
        }

        /**
         * bounce on borders
         * NOTE: screenWidth, screenHeight, worldWidth, and worldHeight needs to be set for this to work properly
         * @param {object} [options]
         * @param {string} [options.sides=all] all, horizontal, vertical, or combination of top, bottom, right, left (e.g., 'top-bottom-right')
         * @param {number} [options.friction=0.5] friction to apply to decelerate if active
         * @param {number} [options.time=150] time in ms to finish bounce
         * @param {string|function} [options.ease=easeInOutSine] ease function or name (see http://easings.net/ for supported names)
         * @param {string} [options.underflow=center] (top/bottom/center and left/right/center, or center) where to place world if too small for screen
         * @return {Viewport} this
         */

    }, {
        key: 'bounce',
        value: function bounce(options) {
            this.plugins['bounce'] = new Bounce(this, options);
            this.pluginsSort();
            return this;
        }

        /**
         * enable pinch to zoom and two-finger touch to drag
         * NOTE: screenWidth, screenHeight, worldWidth, and worldHeight needs to be set for this to work properly
         * @param {number} [options.percent=1.0] percent to modify pinch speed
         * @param {boolean} [options.noDrag] disable two-finger dragging
         * @param {PIXI.Point} [options.center] place this point at center during zoom instead of center of two fingers
         * @return {Viewport} this
         */

    }, {
        key: 'pinch',
        value: function pinch(options) {
            this.plugins['pinch'] = new Pinch(this, options);
            this.pluginsSort();
            return this;
        }

        /**
         * snap to a point
         * @param {number} x
         * @param {number} y
         * @param {object} [options]
         * @param {boolean} [options.topLeft] snap to the top-left of viewport instead of center
         * @param {number} [options.friction=0.8] friction/frame to apply if decelerate is active
         * @param {number} [options.time=1000]
         * @param {string|function} [options.ease=easeInOutSine] ease function or name (see http://easings.net/ for supported names)
         * @param {boolean} [options.interrupt=true] pause snapping with any user input on the viewport
         * @param {boolean} [options.removeOnComplete] removes this plugin after snapping is complete
         * @param {boolean} [options.removeOnInterrupt] removes this plugin if interrupted by any user input
         * @param {boolean} [options.forceStart] starts the snap immediately regardless of whether the viewport is at the desired location
        * @return {Viewport} this
         */

    }, {
        key: 'snap',
        value: function snap(x, y, options) {
            this.plugins['snap'] = new Snap(this, x, y, options);
            this.pluginsSort();
            return this;
        }

        /**
         * follow a target
         * @param {PIXI.DisplayObject} target to follow (object must include {x: x-coordinate, y: y-coordinate})
         * @param {object} [options]
         * @param {number} [options.speed=0] to follow in pixels/frame (0=teleport to location)
         * @param {number} [options.radius] radius (in world coordinates) of center circle where movement is allowed without moving the viewport
         * @return {Viewport} this
         */

    }, {
        key: 'follow',
        value: function follow(target, options) {
            this.plugins['follow'] = new Follow(this, target, options);
            this.pluginsSort();
            return this;
        }

        /**
         * zoom using mouse wheel
         * @param {object} [options]
         * @param {number} [options.percent=0.1] percent to scroll with each spin
         * @param {boolean} [options.reverse] reverse the direction of the scroll
         * @param {PIXI.Point} [options.center] place this point at center during zoom instead of current mouse position
         * @return {Viewport} this
         */

    }, {
        key: 'wheel',
        value: function wheel(options) {
            this.plugins['wheel'] = new Wheel(this, options);
            this.pluginsSort();
            return this;
        }

        /**
         * enable clamping of zoom to constraints
         * NOTE: screenWidth, screenHeight, worldWidth, and worldHeight needs to be set for this to work properly
         * @param {object} [options]
         * @param {number} [options.minWidth] minimum width
         * @param {number} [options.minHeight] minimum height
         * @param {number} [options.maxWidth] maximum width
         * @param {number} [options.maxHeight] maximum height
         * @return {Viewport} this
         */

    }, {
        key: 'clampZoom',
        value: function clampZoom(options) {
            this.plugins['clamp-zoom'] = new ClampZoom(this, options);
            this.pluginsSort();
            return this;
        }

        /**
         * Scroll viewport when mouse hovers near one of the edges or radius-distance from center of screen.
         * @param {object} [options]
         * @param {number} [options.radius] distance from center of screen in screen pixels
         * @param {number} [options.distance] distance from all sides in screen pixels
         * @param {number} [options.top] alternatively, set top distance (leave unset for no top scroll)
         * @param {number} [options.bottom] alternatively, set bottom distance (leave unset for no top scroll)
         * @param {number} [options.left] alternatively, set left distance (leave unset for no top scroll)
         * @param {number} [options.right] alternatively, set right distance (leave unset for no top scroll)
         * @param {number} [options.speed=8] speed in pixels/frame to scroll viewport
         * @param {boolean} [options.reverse] reverse direction of scroll
         * @param {boolean} [options.noDecelerate] don't use decelerate plugin even if it's installed
         * @param {boolean} [options.linear] if using radius, use linear movement (+/- 1, +/- 1) instead of angled movement (Math.cos(angle from center), Math.sin(angle from center))
         */

    }, {
        key: 'mouseEdges',
        value: function mouseEdges(options) {
            this.plugins['mouse-edges'] = new MouseEdges(this, options);
            this.pluginsSort();
            return this;
        }

        /**
         * pause viewport (including animation updates such as decelerate)
         * NOTE: when setting pause=true, all touches and mouse actions are cleared (i.e., if mousedown was active, it becomes inactive for purposes of the viewport)
         * @type {boolean}
         */

    }, {
        key: 'screenWidth',
        get: function get() {
            return this._screenWidth;
        },
        set: function set(value) {
            this._screenWidth = value;
        }

        /**
         * screen height in screen pixels
         * @type {number}
         */

    }, {
        key: 'screenHeight',
        get: function get() {
            return this._screenHeight;
        },
        set: function set(value) {
            this._screenHeight = value;
        }

        /**
         * world width in pixels
         * @type {number}
         */

    }, {
        key: 'worldWidth',
        get: function get() {
            if (this._worldWidth) {
                return this._worldWidth;
            } else {
                return this.width;
            }
        },
        set: function set(value) {
            this._worldWidth = value;
            this.resizePlugins();
        }

        /**
         * world height in pixels
         * @type {number}
         */

    }, {
        key: 'worldHeight',
        get: function get() {
            if (this._worldHeight) {
                return this._worldHeight;
            } else {
                return this.height;
            }
        },
        set: function set(value) {
            this._worldHeight = value;
            this.resizePlugins();
        }
    }, {
        key: 'worldScreenWidth',
        get: function get() {
            return this._screenWidth / this.scale.x;
        }

        /**
         * screen height in world coordinates
         * @type {number}
         * @readonly
         */

    }, {
        key: 'worldScreenHeight',
        get: function get() {
            return this._screenHeight / this.scale.y;
        }

        /**
         * world width in screen coordinates
         * @type {number}
         * @readonly
         */

    }, {
        key: 'screenWorldWidth',
        get: function get() {
            return this._worldWidth * this.scale.x;
        }

        /**
         * world height in screen coordinates
         * @type {number}
         * @readonly
         */

    }, {
        key: 'screenWorldHeight',
        get: function get() {
            return this._worldHeight * this.scale.y;
        }

        /**
         * get center of screen in world coordinates
         * @type {PIXI.PointLike}
         */

    }, {
        key: 'center',
        get: function get() {
            return { x: this.worldScreenWidth / 2 - this.x / this.scale.x, y: this.worldScreenHeight / 2 - this.y / this.scale.y };
        },
        set: function set(value) {
            this.moveCenter(value);
        }
    }, {
        key: 'corner',
        get: function get() {
            return { x: -this.x / this.scale.x, y: -this.y / this.scale.y };
        },
        set: function set(value) {
            this.moveCorner(value);
        }
    }, {
        key: 'right',
        get: function get() {
            return -this.x / this.scale.x + this.worldScreenWidth;
        },
        set: function set(value) {
            this.x = -value * this.scale.x + this.screenWidth;
            this._reset();
        }

        /**
         * world coordinates of the left edge of the screen
         * @type {number}
         */

    }, {
        key: 'left',
        get: function get() {
            return -this.x / this.scale.x;
        },
        set: function set(value) {
            this.x = -value * this.scale.x;
            this._reset();
        }

        /**
         * world coordinates of the top edge of the screen
         * @type {number}
         */

    }, {
        key: 'top',
        get: function get() {
            return -this.y / this.scale.y;
        },
        set: function set(value) {
            this.y = -value * this.scale.y;
            this._reset();
        }

        /**
         * world coordinates of the bottom edge of the screen
         * @type {number}
         */

    }, {
        key: 'bottom',
        get: function get() {
            return -this.y / this.scale.y + this.worldScreenHeight;
        },
        set: function set(value) {
            this.y = -value * this.scale.y + this.screenHeight;
            this._reset();
        }
        /**
         * determines whether the viewport is dirty (i.e., needs to be renderered to the screen because of a change)
         * @type {boolean}
         */

    }, {
        key: 'dirty',
        get: function get() {
            return this._dirty;
        },
        set: function set(value) {
            this._dirty = value;
        }

        /**
         * permanently changes the Viewport's hitArea
         * <p>NOTE: normally the hitArea = PIXI.Rectangle(Viewport.left, Viewport.top, Viewport.worldScreenWidth, Viewport.worldScreenHeight)</p>
         * @type {(PIXI.Rectangle|PIXI.Circle|PIXI.Ellipse|PIXI.Polygon|PIXI.RoundedRectangle)}
         */

    }, {
        key: 'forceHitArea',
        get: function get() {
            return this._forceHitArea;
        },
        set: function set(value) {
            if (value) {
                this._forceHitArea = value;
                this.hitArea = value;
            } else {
                this._forceHitArea = false;
                this.hitArea = new PIXI.Rectangle(0, 0, this.worldWidth, this.worldHeight);
            }
        }
    }, {
        key: 'pause',
        get: function get() {
            return this._pause;
        },
        set: function set(value) {
            this._pause = value;
            if (value) {
                this.touches = [];
                this.leftDown = false;
            }
        }
    }]);

    return Viewport;
}(PIXI.Container);

/**
 * fires after a mouse or touch click
 * @event Viewport#clicked
 * @type {object}
 * @property {PIXI.PointLike} screen
 * @property {PIXI.PointLike} world
 * @property {Viewport} viewport
 */

/**
 * fires when a drag starts
 * @event Viewport#drag-start
 * @type {object}
 * @property {PIXI.PointLike} screen
 * @property {PIXI.PointLike} world
 * @property {Viewport} viewport
 */

/**
 * fires when a drag ends
 * @event Viewport#drag-end
 * @type {object}
 * @property {PIXI.PointLike} screen
 * @property {PIXI.PointLike} world
 * @property {Viewport} viewport
 */

/**
 * fires when a pinch starts
 * @event Viewport#pinch-start
 * @type {Viewport}
 */

/**
 * fires when a pinch end
 * @event Viewport#pinch-end
 * @type {Viewport}
 */

/**
 * fires when a snap starts
 * @event Viewport#snap-start
 * @type {Viewport}
 */

/**
 * fires when a snap ends
 * @event Viewport#snap-end
 * @type {Viewport}
 */

/**
 * fires when a snap-zoom starts
 * @event Viewport#snap-zoom-start
 * @type {Viewport}
 */

/**
 * fires when a snap-zoom ends
 * @event Viewport#snap-zoom-end
 * @type {Viewport}
 */

/**
 * fires when a bounce starts in the x direction
 * @event Viewport#bounce-x-start
 * @type {Viewport}
 */

/**
 * fires when a bounce ends in the x direction
 * @event Viewport#bounce-x-end
 * @type {Viewport}
 */

/**
 * fires when a bounce starts in the y direction
 * @event Viewport#bounce-y-start
 * @type {Viewport}
 */

/**
 * fires when a bounce ends in the y direction
 * @event Viewport#bounce-y-end
 * @type {Viewport}
 */

/**
 * fires when for a mouse wheel event
 * @event Viewport#wheel
 * @type {object}
 * @property {object} wheel
 * @property {number} wheel.dx
 * @property {number} wheel.dy
 * @property {number} wheel.dz
 * @property {Viewport} viewport
 */

/**
 * fires when a wheel-scroll occurs
 * @event Viewport#wheel-scroll
 * @type {Viewport}
 */

/**
 * fires when a mouse-edge starts to scroll
 * @event Viewport#mouse-edge-start
 * @type {Viewport}
 */

/**
 * fires when the mouse-edge scrolling ends
 * @event Viewport#mouse-edge-end
 * @type {Viewport}
 */

/**
 * fires when viewport moves through UI interaction, deceleration, or follow
 * @event Viewport#moved
 * @type {object}
 * @property {Viewport} viewport
 * @property {string} type (drag, snap, pinch, follow, bounce-x, bounce-y, clamp-x, clamp-y, decelerate, mouse-edges, wheel)
 */

/**
 * fires when viewport moves through UI interaction, deceleration, or follow
 * @event Viewport#zoomed
 * @type {object}
 * @property {Viewport} viewport
 * @property {string} type (drag-zoom, pinch, wheel, clamp-zoom)
 */

PIXI.extras.Viewport = Viewport;

module.exports = Viewport;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy92aWV3cG9ydC5qcyJdLCJuYW1lcyI6WyJ1dGlscyIsInJlcXVpcmUiLCJEcmFnIiwiUGluY2giLCJDbGFtcCIsIkNsYW1wWm9vbSIsIkRlY2VsZXJhdGUiLCJCb3VuY2UiLCJTbmFwIiwiU25hcFpvb20iLCJGb2xsb3ciLCJXaGVlbCIsIk1vdXNlRWRnZXMiLCJQTFVHSU5fT1JERVIiLCJWaWV3cG9ydCIsIm9wdGlvbnMiLCJwbHVnaW5zIiwicGx1Z2luc0xpc3QiLCJfc2NyZWVuV2lkdGgiLCJzY3JlZW5XaWR0aCIsIl9zY3JlZW5IZWlnaHQiLCJzY3JlZW5IZWlnaHQiLCJfd29ybGRXaWR0aCIsIndvcmxkV2lkdGgiLCJfd29ybGRIZWlnaHQiLCJ3b3JsZEhlaWdodCIsImhpdEFyZWFGdWxsU2NyZWVuIiwiZGVmYXVsdHMiLCJmb3JjZUhpdEFyZWEiLCJ0aHJlc2hvbGQiLCJpbnRlcmFjdGlvbiIsImRpdiIsImRpdldoZWVsIiwiZG9jdW1lbnQiLCJib2R5IiwibGlzdGVuZXJzIiwidG91Y2hlcyIsInRpY2tlciIsIlBJWEkiLCJzaGFyZWQiLCJ0aWNrZXJGdW5jdGlvbiIsInVwZGF0ZSIsImFkZCIsInJlbW92ZSIsInJlbW92ZUV2ZW50TGlzdGVuZXIiLCJ3aGVlbEZ1bmN0aW9uIiwicmVtb3ZlTGlzdGVuZXJzIiwicGF1c2UiLCJwbHVnaW4iLCJlbGFwc2VkTVMiLCJoaXRBcmVhIiwieCIsImxlZnQiLCJ5IiwidG9wIiwid2lkdGgiLCJ3b3JsZFNjcmVlbldpZHRoIiwiaGVpZ2h0Iiwid29ybGRTY3JlZW5IZWlnaHQiLCJ3aW5kb3ciLCJpbm5lcldpZHRoIiwiaW5uZXJIZWlnaHQiLCJyZXNpemVQbHVnaW5zIiwicmVzaXplIiwiaW50ZXJhY3RpdmUiLCJSZWN0YW5nbGUiLCJvbiIsImRvd24iLCJtb3ZlIiwidXAiLCJlIiwiaGFuZGxlV2hlZWwiLCJhZGRFdmVudExpc3RlbmVyIiwibGVmdERvd24iLCJkYXRhIiwicG9pbnRlclR5cGUiLCJvcmlnaW5hbEV2ZW50IiwiYnV0dG9uIiwicHVzaCIsInBvaW50ZXJJZCIsImNvdW50RG93blBvaW50ZXJzIiwibGFzdCIsImdsb2JhbCIsImRlY2VsZXJhdGUiLCJib3VuY2UiLCJNYXRoIiwiYWJzIiwidG9YIiwidG9ZIiwiY2xpY2tlZEF2YWlsYWJsZSIsImNoYW5nZSIsImRpc3RYIiwiZGlzdFkiLCJjaGVja1RocmVzaG9sZCIsIk1vdXNlRXZlbnQiLCJpIiwibGVuZ3RoIiwic3BsaWNlIiwiZW1pdCIsInNjcmVlbiIsIndvcmxkIiwidG9Xb3JsZCIsInZpZXdwb3J0IiwiZXZ0IiwicG9pbnQiLCJQb2ludCIsIm1hcFBvc2l0aW9uVG9Qb2ludCIsImNsaWVudFgiLCJjbGllbnRZIiwidG9Mb2NhbCIsImdldFBvaW50ZXJQb3NpdGlvbiIsInJpZ2h0IiwiYm90dG9tIiwicmVzdWx0Iiwid2hlZWwiLCJhcmd1bWVudHMiLCJ0b0dsb2JhbCIsImlzTmFOIiwicG9zaXRpb24iLCJzZXQiLCJzY2FsZSIsIl9yZXNldCIsImNlbnRlciIsInNjYWxlWSIsInNhdmUiLCJtb3ZlQ2VudGVyIiwic2NhbGVYIiwicGVyY2VudCIsImZpdFdpZHRoIiwicGx1Z2luc1NvcnQiLCJjb3JuZXJQb2ludCIsInJlc3VsdHMiLCJwb2ludGVycyIsInRyYWNrZWRQb2ludGVycyIsImtleSIsInBvaW50ZXIiLCJpbmRleE9mIiwicmVzZXQiLCJjbGFtcCIsImRpcnR5IiwidHlwZSIsInJlc3VtZSIsInRhcmdldCIsInZhbHVlIiwibW92ZUNvcm5lciIsIl9kaXJ0eSIsIl9mb3JjZUhpdEFyZWEiLCJfcGF1c2UiLCJDb250YWluZXIiLCJleHRyYXMiLCJtb2R1bGUiLCJleHBvcnRzIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFBQSxJQUFNQSxRQUFTQyxRQUFRLFNBQVIsQ0FBZjtBQUNBLElBQU1DLE9BQU9ELFFBQVEsUUFBUixDQUFiO0FBQ0EsSUFBTUUsUUFBUUYsUUFBUSxTQUFSLENBQWQ7QUFDQSxJQUFNRyxR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SDtBQUNKOzs7O0VBcHBDa0JuQyxLQUFLOEcsUzs7QUF1cEM1Qjs7Ozs7Ozs7O0FBU0E7Ozs7Ozs7OztBQVNBOzs7Ozs7Ozs7QUFTQTs7Ozs7O0FBTUE7Ozs7OztBQU1BOzs7Ozs7QUFNQTs7Ozs7O0FBTUE7Ozs7OztBQU1BOzs7Ozs7QUFNQTs7Ozs7O0FBTUE7Ozs7OztBQU1BOzs7Ozs7QUFNQTs7Ozs7O0FBTUE7Ozs7Ozs7Ozs7O0FBV0E7Ozs7OztBQU1BOzs7Ozs7QUFNQTs7Ozs7O0FBTUE7Ozs7Ozs7O0FBUUE7Ozs7Ozs7O0FBUUE5RyxLQUFLK0csTUFBTCxDQUFZdkksUUFBWixHQUF1QkEsUUFBdkI7O0FBRUF3SSxPQUFPQyxPQUFQLEdBQWlCekksUUFBakIiLCJmaWxlIjoidmlld3BvcnQuanMiLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCB1dGlscyA9ICByZXF1aXJlKCcuL3V0aWxzJylcclxuY29uc3QgRHJhZyA9IHJlcXVpcmUoJy4vZHJhZycpXHJcbmNvbnN0IFBpbmNoID0gcmVxdWlyZSgnLi9waW5jaCcpXHJcbmNvbnN0IENsYW1wID0gcmVxdWlyZSgnLi9jbGFtcCcpXHJcbmNvbnN0IENsYW1wWm9vbSA9IHJlcXVpcmUoJy4vY2xhbXAtem9vbScpXHJcbmNvbnN0IERlY2VsZXJhdGUgPSByZXF1aXJlKCcuL2RlY2VsZXJhdGUnKVxyXG5jb25zdCBCb3VuY2UgPSByZXF1aXJlKCcuL2JvdW5jZScpXHJcbmNvbnN0IFNuYXAgPSByZXF1aXJlKCcuL3NuYXAnKVxyXG5jb25zdCBTbmFwWm9vbSA9IHJlcXVpcmUoJy4vc25hcC16b29tJylcclxuY29uc3QgRm9sbG93ID0gcmVxdWlyZSgnLi9mb2xsb3cnKVxyXG5jb25zdCBXaGVlbCA9IHJlcXVpcmUoJy4vd2hlZWwnKVxyXG5jb25zdCBNb3VzZUVkZ2VzID0gcmVxdWlyZSgnLi9tb3VzZS1lZGdlcycpXHJcblxyXG5jb25zdCBQTFVHSU5fT1JERVIgPSBbJ2RyYWcnLCAncGluY2gnLCAnd2hlZWwnLCAnZm9sbG93JywgJ21vdXNlLWVkZ2VzJywgJ2RlY2VsZXJhdGUnLCAnYm91bmNlJywgJ3NuYXAtem9vbScsICdjbGFtcC16b29tJywgJ3NuYXAnLCAnY2xhbXAnXVxyXG5cclxuY2xhc3MgVmlld3BvcnQgZXh0ZW5kcyBQSVhJLkNvbnRhaW5lclxyXG57XHJcbiAgICAvKipcclxuICAgICAqIEBleHRlbmRzIFBJWEkuQ29udGFpbmVyXHJcbiAgICAgKiBAZXh0ZW5kcyBFdmVudEVtaXR0ZXJcclxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBbb3B0aW9uc11cclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy5zY3JlZW5XaWR0aD13aW5kb3cuaW5uZXJXaWR0aF1cclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy5zY3JlZW5IZWlnaHQ9d2luZG93LmlubmVySGVpZ2h0XVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLndvcmxkV2lkdGg9dGhpcy53aWR0aF1cclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy53b3JsZEhlaWdodD10aGlzLmhlaWdodF1cclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy50aHJlc2hvbGQgPSA1XSBudW1iZXIgb2YgcGl4ZWxzIHRvIG1vdmUgdG8gdHJpZ2dlciBhbiBpbnB1dCBldmVudCAoZS5nLiwgZHJhZywgcGluY2gpIG9yIGRpc2FibGUgYSBjbGlja2VkIGV2ZW50XHJcbiAgICAgKiBAcGFyYW0geyhQSVhJLlJlY3RhbmdsZXxQSVhJLkNpcmNsZXxQSVhJLkVsbGlwc2V8UElYSS5Qb2x5Z29ufFBJWEkuUm91bmRlZFJlY3RhbmdsZSl9IFtvcHRpb25zLmZvcmNlSGl0QXJlYV0gY2hhbmdlIHRoZSBkZWZhdWx0IGhpdEFyZWEgZnJvbSB3b3JsZCBzaXplIHRvIGEgbmV3IHZhbHVlXHJcbiAgICAgKiBAcGFyYW0ge1BJWEkudGlja2VyLlRpY2tlcn0gW29wdGlvbnMudGlja2VyPVBJWEkudGlja2VyLnNoYXJlZF0gdXNlIHRoaXMgUElYSS50aWNrZXIgZm9yIHVwZGF0ZXNcclxuICAgICAqIEBwYXJhbSB7UElYSS5JbnRlcmFjdGlvbk1hbmFnZXJ9IFtvcHRpb25zLmludGVyYWN0aW9uPW51bGxdIEludGVyYWN0aW9uTWFuYWdlciwgYXZhaWxhYmxlIGZyb20gaW5zdGFudGlhdGVkIFdlYkdMUmVuZGVyZXIvQ2FudmFzUmVuZGVyZXIucGx1Z2lucy5pbnRlcmFjdGlvbiAtIHVzZWQgdG8gY2FsY3VsYXRlIHBvaW50ZXIgcG9zdGlvbiByZWxhdGl2ZSB0byBjYW52YXMgbG9jYXRpb24gb24gc2NyZWVuXHJcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBbb3B0aW9ucy5kaXZXaGVlbD1kb2N1bWVudC5ib2R5XSBkaXYgdG8gYXR0YWNoIHRoZSB3aGVlbCBldmVudFxyXG4gICAgICogQGZpcmVzIGNsaWNrZWRcclxuICAgICAqIEBmaXJlcyBkcmFnLXN0YXJ0XHJcbiAgICAgKiBAZmlyZXMgZHJhZy1lbmRcclxuICAgICAqIEBmaXJlcyBkcmFnLXJlbW92ZVxyXG4gICAgICogQGZpcmVzIHBpbmNoLXN0YXJ0XHJcbiAgICAgKiBAZmlyZXMgcGluY2gtZW5kXHJcbiAgICAgKiBAZmlyZXMgcGluY2gtcmVtb3ZlXHJcbiAgICAgKiBAZmlyZXMgc25hcC1zdGFydFxyXG4gICAgICogQGZpcmVzIHNuYXAtZW5kXHJcbiAgICAgKiBAZmlyZXMgc25hcC1yZW1vdmVcclxuICAgICAqIEBmaXJlcyBzbmFwLXpvb20tc3RhcnRcclxuICAgICAqIEBmaXJlcyBzbmFwLXpvb20tZW5kXHJcbiAgICAgKiBAZmlyZXMgc25hcC16b29tLXJlbW92ZVxyXG4gICAgICogQGZpcmVzIGJvdW5jZS14LXN0YXJ0XHJcbiAgICAgKiBAZmlyZXMgYm91bmNlLXgtZW5kXHJcbiAgICAgKiBAZmlyZXMgYm91bmNlLXktc3RhcnRcclxuICAgICAqIEBmaXJlcyBib3VuY2UteS1lbmRcclxuICAgICAqIEBmaXJlcyBib3VuY2UtcmVtb3ZlXHJcbiAgICAgKiBAZmlyZXMgd2hlZWxcclxuICAgICAqIEBmaXJlcyB3aGVlbC1yZW1vdmVcclxuICAgICAqIEBmaXJlcyB3aGVlbC1zY3JvbGxcclxuICAgICAqIEBmaXJlcyB3aGVlbC1zY3JvbGwtcmVtb3ZlXHJcbiAgICAgKiBAZmlyZXMgbW91c2UtZWRnZS1zdGFydFxyXG4gICAgICogQGZpcmVzIG1vdXNlLWVkZ2UtZW5kXHJcbiAgICAgKiBAZmlyZXMgbW91c2UtZWRnZS1yZW1vdmVcclxuICAgICAqIEBmaXJlcyBtb3ZlZFxyXG4gICAgICovXHJcbiAgICBjb25zdHJ1Y3RvcihvcHRpb25zKVxyXG4gICAge1xyXG4gICAgICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9XHJcbiAgICAgICAgc3VwZXIoKVxyXG4gICAgICAgIHRoaXMucGx1Z2lucyA9IHt9XHJcbiAgICAgICAgdGhpcy5wbHVnaW5zTGlzdCA9IFtdXHJcbiAgICAgICAgdGhpcy5fc2NyZWVuV2lkdGggPSBvcHRpb25zLnNjcmVlbldpZHRoXHJcbiAgICAgICAgdGhpcy5fc2NyZWVuSGVpZ2h0ID0gb3B0aW9ucy5zY3JlZW5IZWlnaHRcclxuICAgICAgICB0aGlzLl93b3JsZFdpZHRoID0gb3B0aW9ucy53b3JsZFdpZHRoXHJcbiAgICAgICAgdGhpcy5fd29ybGRIZWlnaHQgPSBvcHRpb25zLndvcmxkSGVpZ2h0XHJcbiAgICAgICAgdGhpcy5oaXRBcmVhRnVsbFNjcmVlbiA9IHV0aWxzLmRlZmF1bHRzKG9wdGlvbnMuaGl0QXJlYUZ1bGxTY3JlZW4sIHRydWUpXHJcbiAgICAgICAgdGhpcy5mb3JjZUhpdEFyZWEgPSBvcHRpb25zLmZvcmNlSGl0QXJlYVxyXG4gICAgICAgIHRoaXMudGhyZXNob2xkID0gdXRpbHMuZGVmYXVsdHMob3B0aW9ucy50aHJlc2hvbGQsIDUpXHJcbiAgICAgICAgdGhpcy5pbnRlcmFjdGlvbiA9IG9wdGlvbnMuaW50ZXJhY3Rpb24gfHwgbnVsbFxyXG4gICAgICAgIHRoaXMuZGl2ID0gb3B0aW9ucy5kaXZXaGVlbCB8fCBkb2N1bWVudC5ib2R5XHJcbiAgICAgICAgdGhpcy5saXN0ZW5lcnModGhpcy5kaXYpXHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIGFjdGl2ZSB0b3VjaCBwb2ludCBpZHMgb24gdGhlIHZpZXdwb3J0XHJcbiAgICAgICAgICogQHR5cGUge251bWJlcltdfVxyXG4gICAgICAgICAqIEByZWFkb25seVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRoaXMudG91Y2hlcyA9IFtdXHJcblxyXG4gICAgICAgIHRoaXMudGlja2VyID0gb3B0aW9ucy50aWNrZXIgfHwgUElYSS50aWNrZXIuc2hhcmVkXHJcbiAgICAgICAgdGhpcy50aWNrZXJGdW5jdGlvbiA9ICgpID0+IHRoaXMudXBkYXRlKClcclxuICAgICAgICB0aGlzLnRpY2tlci5hZGQodGhpcy50aWNrZXJGdW5jdGlvbilcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIHJlbW92ZXMgYWxsIGV2ZW50IGxpc3RlbmVycyBmcm9tIHZpZXdwb3J0XHJcbiAgICAgKiAodXNlZnVsIGZvciBjbGVhbnVwIG9mIHdoZWVsIGFuZCB0aWNrZXIgZXZlbnRzIHdoZW4gcmVtb3Zpbmcgdmlld3BvcnQpXHJcbiAgICAgKi9cclxuICAgIHJlbW92ZUxpc3RlbmVycygpXHJcbiAgICB7XHJcbiAgICAgICAgdGhpcy50aWNrZXIucmVtb3ZlKHRoaXMudGlja2VyRnVuY3Rpb24pXHJcbiAgICAgICAgdGhpcy5kaXYucmVtb3ZlRXZlbnRMaXN0ZW5lcignd2hlZWwnLCB0aGlzLndoZWVsRnVuY3Rpb24pXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBvdmVycmlkZXMgUElYSS5Db250YWluZXIncyBkZXN0cm95IHRvIGFsc28gcmVtb3ZlIHRoZSAnd2hlZWwnIGFuZCBQSVhJLlRpY2tlciBsaXN0ZW5lcnNcclxuICAgICAqL1xyXG4gICAgZGVzdHJveShvcHRpb25zKVxyXG4gICAge1xyXG4gICAgICAgIHN1cGVyLmRlc3Ryb3kob3B0aW9ucylcclxuICAgICAgICB0aGlzLnJlbW92ZUxpc3RlbmVycygpXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiB1cGRhdGUgYW5pbWF0aW9uc1xyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgdXBkYXRlKClcclxuICAgIHtcclxuICAgICAgICBpZiAoIXRoaXMucGF1c2UpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBmb3IgKGxldCBwbHVnaW4gb2YgdGhpcy5wbHVnaW5zTGlzdClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgcGx1Z2luLnVwZGF0ZSh0aGlzLnRpY2tlci5lbGFwc2VkTVMpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCF0aGlzLmZvcmNlSGl0QXJlYSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMuaGl0QXJlYS54ID0gdGhpcy5sZWZ0XHJcbiAgICAgICAgICAgIHRoaXMuaGl0QXJlYS55ID0gdGhpcy50b3BcclxuICAgICAgICAgICAgdGhpcy5oaXRBcmVhLndpZHRoID0gdGhpcy53b3JsZFNjcmVlbldpZHRoXHJcbiAgICAgICAgICAgIHRoaXMuaGl0QXJlYS5oZWlnaHQgPSB0aGlzLndvcmxkU2NyZWVuSGVpZ2h0XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogdXNlIHRoaXMgdG8gc2V0IHNjcmVlbiBhbmQgd29ybGQgc2l6ZXMtLW5lZWRlZCBmb3IgcGluY2gvd2hlZWwvY2xhbXAvYm91bmNlXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gc2NyZWVuV2lkdGhcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBzY3JlZW5IZWlnaHRcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbd29ybGRXaWR0aF1cclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbd29ybGRIZWlnaHRdXHJcbiAgICAgKi9cclxuICAgIHJlc2l6ZShzY3JlZW5XaWR0aCwgc2NyZWVuSGVpZ2h0LCB3b3JsZFdpZHRoLCB3b3JsZEhlaWdodClcclxuICAgIHtcclxuICAgICAgICB0aGlzLl9zY3JlZW5XaWR0aCA9IHNjcmVlbldpZHRoIHx8IHdpbmRvdy5pbm5lcldpZHRoXHJcbiAgICAgICAgdGhpcy5fc2NyZWVuSGVpZ2h0ID0gc2NyZWVuSGVpZ2h0IHx8IHdpbmRvdy5pbm5lckhlaWdodFxyXG4gICAgICAgIHRoaXMuX3dvcmxkV2lkdGggPSB3b3JsZFdpZHRoXHJcbiAgICAgICAgdGhpcy5fd29ybGRIZWlnaHQgPSB3b3JsZEhlaWdodFxyXG4gICAgICAgIHRoaXMucmVzaXplUGx1Z2lucygpXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBjYWxsZWQgYWZ0ZXIgYSB3b3JsZFdpZHRoL0hlaWdodCBjaGFuZ2VcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIHJlc2l6ZVBsdWdpbnMoKVxyXG4gICAge1xyXG4gICAgICAgIGZvciAobGV0IHBsdWdpbiBvZiB0aGlzLnBsdWdpbnNMaXN0KVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgcGx1Z2luLnJlc2l6ZSgpXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogc2NyZWVuIHdpZHRoIGluIHNjcmVlbiBwaXhlbHNcclxuICAgICAqIEB0eXBlIHtudW1iZXJ9XHJcbiAgICAgKi9cclxuICAgIGdldCBzY3JlZW5XaWR0aCgpXHJcbiAgICB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NjcmVlbldpZHRoXHJcbiAgICB9XHJcbiAgICBzZXQgc2NyZWVuV2lkdGgodmFsdWUpXHJcbiAgICB7XHJcbiAgICAgICAgdGhpcy5fc2NyZWVuV2lkdGggPSB2YWx1ZVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogc2NyZWVuIGhlaWdodCBpbiBzY3JlZW4gcGl4ZWxzXHJcbiAgICAgKiBAdHlwZSB7bnVtYmVyfVxyXG4gICAgICovXHJcbiAgICBnZXQgc2NyZWVuSGVpZ2h0KClcclxuICAgIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fc2NyZWVuSGVpZ2h0XHJcbiAgICB9XHJcbiAgICBzZXQgc2NyZWVuSGVpZ2h0KHZhbHVlKVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMuX3NjcmVlbkhlaWdodCA9IHZhbHVlXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiB3b3JsZCB3aWR0aCBpbiBwaXhlbHNcclxuICAgICAqIEB0eXBlIHtudW1iZXJ9XHJcbiAgICAgKi9cclxuICAgIGdldCB3b3JsZFdpZHRoKClcclxuICAgIHtcclxuICAgICAgICBpZiAodGhpcy5fd29ybGRXaWR0aClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl93b3JsZFdpZHRoXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2VcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLndpZHRoXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgc2V0IHdvcmxkV2lkdGgodmFsdWUpXHJcbiAgICB7XHJcbiAgICAgICAgdGhpcy5fd29ybGRXaWR0aCA9IHZhbHVlXHJcbiAgICAgICAgdGhpcy5yZXNpemVQbHVnaW5zKClcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIHdvcmxkIGhlaWdodCBpbiBwaXhlbHNcclxuICAgICAqIEB0eXBlIHtudW1iZXJ9XHJcbiAgICAgKi9cclxuICAgIGdldCB3b3JsZEhlaWdodCgpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKHRoaXMuX3dvcmxkSGVpZ2h0KVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3dvcmxkSGVpZ2h0XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2VcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmhlaWdodFxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHNldCB3b3JsZEhlaWdodCh2YWx1ZSlcclxuICAgIHtcclxuICAgICAgICB0aGlzLl93b3JsZEhlaWdodCA9IHZhbHVlXHJcbiAgICAgICAgdGhpcy5yZXNpemVQbHVnaW5zKClcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGFkZCBpbnB1dCBsaXN0ZW5lcnNcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIGxpc3RlbmVycyhkaXYpXHJcbiAgICB7XHJcbiAgICAgICAgdGhpcy5pbnRlcmFjdGl2ZSA9IHRydWVcclxuICAgICAgICBpZiAoIXRoaXMuZm9yY2VIaXRBcmVhKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5oaXRBcmVhID0gbmV3IFBJWEkuUmVjdGFuZ2xlKDAsIDAsIHRoaXMud29ybGRXaWR0aCwgdGhpcy53b3JsZEhlaWdodClcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5vbigncG9pbnRlcmRvd24nLCB0aGlzLmRvd24pXHJcbiAgICAgICAgdGhpcy5vbigncG9pbnRlcm1vdmUnLCB0aGlzLm1vdmUpXHJcbiAgICAgICAgdGhpcy5vbigncG9pbnRlcnVwJywgdGhpcy51cClcclxuICAgICAgICB0aGlzLm9uKCdwb2ludGVydXBvdXRzaWRlJywgdGhpcy51cClcclxuICAgICAgICB0aGlzLm9uKCdwb2ludGVyY2FuY2VsJywgdGhpcy51cClcclxuICAgICAgICB0aGlzLm9uKCdwb2ludGVyb3V0JywgdGhpcy51cClcclxuICAgICAgICB0aGlzLndoZWVsRnVuY3Rpb24gPSAoZSkgPT4gdGhpcy5oYW5kbGVXaGVlbChlKVxyXG4gICAgICAgIGRpdi5hZGRFdmVudExpc3RlbmVyKCd3aGVlbCcsIHRoaXMud2hlZWxGdW5jdGlvbilcclxuICAgICAgICB0aGlzLmxlZnREb3duID0gZmFsc2VcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGhhbmRsZSBkb3duIGV2ZW50c1xyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgZG93bihlKVxyXG4gICAge1xyXG4gICAgICAgIGlmICh0aGlzLnBhdXNlKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgcmV0dXJuXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChlLmRhdGEucG9pbnRlclR5cGUgPT09ICdtb3VzZScpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpZiAoZS5kYXRhLm9yaWdpbmFsRXZlbnQuYnV0dG9uID09IDApXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHRoaXMubGVmdERvd24gPSB0cnVlXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy50b3VjaGVzLnB1c2goZS5kYXRhLnBvaW50ZXJJZClcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICh0aGlzLmNvdW50RG93blBvaW50ZXJzKCkgPT09IDEpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLmxhc3QgPSB7IHg6IGUuZGF0YS5nbG9iYWwueCwgeTogZS5kYXRhLmdsb2JhbC55IH1cclxuXHJcbiAgICAgICAgICAgIC8vIGNsaWNrZWQgZXZlbnQgZG9lcyBub3QgZmlyZSBpZiB2aWV3cG9ydCBpcyBkZWNlbGVyYXRpbmcgb3IgYm91bmNpbmdcclxuICAgICAgICAgICAgY29uc3QgZGVjZWxlcmF0ZSA9IHRoaXMucGx1Z2luc1snZGVjZWxlcmF0ZSddXHJcbiAgICAgICAgICAgIGNvbnN0IGJvdW5jZSA9IHRoaXMucGx1Z2luc1snYm91bmNlJ11cclxuICAgICAgICAgICAgaWYgKCghZGVjZWxlcmF0ZSB8fCAoTWF0aC5hYnMoZGVjZWxlcmF0ZS54KSA8IHRoaXMudGhyZXNob2xkICYmIE1hdGguYWJzKGRlY2VsZXJhdGUueSkgPCB0aGlzLnRocmVzaG9sZCkpICYmICghYm91bmNlIHx8ICghYm91bmNlLnRvWCAmJiAhYm91bmNlLnRvWSkpKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNsaWNrZWRBdmFpbGFibGUgPSB0cnVlXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNsaWNrZWRBdmFpbGFibGUgPSBmYWxzZVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2VcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMuY2xpY2tlZEF2YWlsYWJsZSA9IGZhbHNlXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmb3IgKGxldCBwbHVnaW4gb2YgdGhpcy5wbHVnaW5zTGlzdClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHBsdWdpbi5kb3duKGUpXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogd2hldGhlciBjaGFuZ2UgZXhjZWVkcyB0aHJlc2hvbGRcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gY2hhbmdlXHJcbiAgICAgKi9cclxuICAgIGNoZWNrVGhyZXNob2xkKGNoYW5nZSlcclxuICAgIHtcclxuICAgICAgICBpZiAoTWF0aC5hYnMoY2hhbmdlKSA+PSB0aGlzLnRocmVzaG9sZClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBmYWxzZVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogaGFuZGxlIG1vdmUgZXZlbnRzXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBtb3ZlKGUpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKHRoaXMucGF1c2UpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICByZXR1cm5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZvciAobGV0IHBsdWdpbiBvZiB0aGlzLnBsdWdpbnNMaXN0KVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgcGx1Z2luLm1vdmUoZSlcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICh0aGlzLmNsaWNrZWRBdmFpbGFibGUpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBjb25zdCBkaXN0WCA9IGUuZGF0YS5nbG9iYWwueCAtIHRoaXMubGFzdC54XHJcbiAgICAgICAgICAgIGNvbnN0IGRpc3RZID0gZS5kYXRhLmdsb2JhbC55IC0gdGhpcy5sYXN0LnlcclxuICAgICAgICAgICAgaWYgKHRoaXMuY2hlY2tUaHJlc2hvbGQoZGlzdFgpIHx8IHRoaXMuY2hlY2tUaHJlc2hvbGQoZGlzdFkpKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNsaWNrZWRBdmFpbGFibGUgPSBmYWxzZVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogaGFuZGxlIHVwIGV2ZW50c1xyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgdXAoZSlcclxuICAgIHtcclxuICAgICAgICBpZiAodGhpcy5wYXVzZSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHJldHVyblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKGUuZGF0YS5vcmlnaW5hbEV2ZW50IGluc3RhbmNlb2YgTW91c2VFdmVudCAmJiBlLmRhdGEub3JpZ2luYWxFdmVudC5idXR0b24gPT0gMClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMubGVmdERvd24gPSBmYWxzZVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKGUuZGF0YS5wb2ludGVyVHlwZSAhPT0gJ21vdXNlJylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy50b3VjaGVzLmxlbmd0aDsgaSsrKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy50b3VjaGVzW2ldID09PSBlLmRhdGEucG9pbnRlcklkKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMudG91Y2hlcy5zcGxpY2UoaSwgMSlcclxuICAgICAgICAgICAgICAgICAgICBicmVha1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmb3IgKGxldCBwbHVnaW4gb2YgdGhpcy5wbHVnaW5zTGlzdClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHBsdWdpbi51cChlKVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHRoaXMuY2xpY2tlZEF2YWlsYWJsZSAmJiB0aGlzLmNvdW50RG93blBvaW50ZXJzKCkgPT09IDApXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLmVtaXQoJ2NsaWNrZWQnLCB7IHNjcmVlbjogdGhpcy5sYXN0LCB3b3JsZDogdGhpcy50b1dvcmxkKHRoaXMubGFzdCksIHZpZXdwb3J0OiB0aGlzIH0pXHJcbiAgICAgICAgICAgIHRoaXMuY2xpY2tlZEF2YWlsYWJsZSA9IGZhbHNlXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogZ2V0cyBwb2ludGVyIHBvc2l0aW9uIGlmIHRoaXMuaW50ZXJhY3Rpb24gaXMgc2V0XHJcbiAgICAgKiBAcGFyYW0ge1VJRXZlbnR9IGV2dFxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgZ2V0UG9pbnRlclBvc2l0aW9uKGV2dClcclxuICAgIHtcclxuICAgICAgICBsZXQgcG9pbnQgPSBuZXcgUElYSS5Qb2ludCgpXHJcbiAgICAgICAgaWYgKHRoaXMuaW50ZXJhY3Rpb24pXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLmludGVyYWN0aW9uLm1hcFBvc2l0aW9uVG9Qb2ludChwb2ludCwgZXZ0LmNsaWVudFgsIGV2dC5jbGllbnRZKVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBwb2ludC54ID0gZXZ0LmNsaWVudFhcclxuICAgICAgICAgICAgcG9pbnQueSA9IGV2dC5jbGllbnRZXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBwb2ludFxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogaGFuZGxlIHdoZWVsIGV2ZW50c1xyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgaGFuZGxlV2hlZWwoZSlcclxuICAgIHtcclxuICAgICAgICBpZiAodGhpcy5wYXVzZSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHJldHVyblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gb25seSBoYW5kbGUgd2hlZWwgZXZlbnRzIHdoZXJlIHRoZSBtb3VzZSBpcyBvdmVyIHRoZSB2aWV3cG9ydFxyXG4gICAgICAgIGNvbnN0IHBvaW50ID0gdGhpcy50b0xvY2FsKHRoaXMuZ2V0UG9pbnRlclBvc2l0aW9uKGUpKVxyXG4gICAgICAgIGlmICh0aGlzLmxlZnQgPD0gcG9pbnQueCAmJiBwb2ludC54IDw9IHRoaXMucmlnaHQgJiYgdGhpcy50b3AgPD0gcG9pbnQueSAmJiBwb2ludC55IDw9IHRoaXMuYm90dG9tKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgbGV0IHJlc3VsdFxyXG4gICAgICAgICAgICBmb3IgKGxldCBwbHVnaW4gb2YgdGhpcy5wbHVnaW5zTGlzdClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaWYgKHBsdWdpbi53aGVlbChlKSlcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSB0cnVlXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdFxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGNoYW5nZSBjb29yZGluYXRlcyBmcm9tIHNjcmVlbiB0byB3b3JsZFxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ8UElYSS5Qb2ludH0geFxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFt5XVxyXG4gICAgICogQHJldHVybnMge1BJWEkuUG9pbnR9XHJcbiAgICAgKi9cclxuICAgIHRvV29ybGQoKVxyXG4gICAge1xyXG4gICAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAyKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgY29uc3QgeCA9IGFyZ3VtZW50c1swXVxyXG4gICAgICAgICAgICBjb25zdCB5ID0gYXJndW1lbnRzWzFdXHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnRvTG9jYWwoeyB4LCB5IH0pXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2VcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnRvTG9jYWwoYXJndW1lbnRzWzBdKVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGNoYW5nZSBjb29yZGluYXRlcyBmcm9tIHdvcmxkIHRvIHNjcmVlblxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ8UElYSS5Qb2ludH0geFxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFt5XVxyXG4gICAgICogQHJldHVybnMge1BJWEkuUG9pbnR9XHJcbiAgICAgKi9cclxuICAgIHRvU2NyZWVuKClcclxuICAgIHtcclxuICAgICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMilcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGNvbnN0IHggPSBhcmd1bWVudHNbMF1cclxuICAgICAgICAgICAgY29uc3QgeSA9IGFyZ3VtZW50c1sxXVxyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy50b0dsb2JhbCh7IHgsIHkgfSlcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgY29uc3QgcG9pbnQgPSBhcmd1bWVudHNbMF1cclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMudG9HbG9iYWwocG9pbnQpXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogc2NyZWVuIHdpZHRoIGluIHdvcmxkIGNvb3JkaW5hdGVzXHJcbiAgICAgKiBAdHlwZSB7bnVtYmVyfVxyXG4gICAgICogQHJlYWRvbmx5XHJcbiAgICAgKi9cclxuICAgIGdldCB3b3JsZFNjcmVlbldpZHRoKClcclxuICAgIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fc2NyZWVuV2lkdGggLyB0aGlzLnNjYWxlLnhcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIHNjcmVlbiBoZWlnaHQgaW4gd29ybGQgY29vcmRpbmF0ZXNcclxuICAgICAqIEB0eXBlIHtudW1iZXJ9XHJcbiAgICAgKiBAcmVhZG9ubHlcclxuICAgICAqL1xyXG4gICAgZ2V0IHdvcmxkU2NyZWVuSGVpZ2h0KClcclxuICAgIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fc2NyZWVuSGVpZ2h0IC8gdGhpcy5zY2FsZS55XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiB3b3JsZCB3aWR0aCBpbiBzY3JlZW4gY29vcmRpbmF0ZXNcclxuICAgICAqIEB0eXBlIHtudW1iZXJ9XHJcbiAgICAgKiBAcmVhZG9ubHlcclxuICAgICAqL1xyXG4gICAgZ2V0IHNjcmVlbldvcmxkV2lkdGgoKVxyXG4gICAge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl93b3JsZFdpZHRoICogdGhpcy5zY2FsZS54XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiB3b3JsZCBoZWlnaHQgaW4gc2NyZWVuIGNvb3JkaW5hdGVzXHJcbiAgICAgKiBAdHlwZSB7bnVtYmVyfVxyXG4gICAgICogQHJlYWRvbmx5XHJcbiAgICAgKi9cclxuICAgIGdldCBzY3JlZW5Xb3JsZEhlaWdodCgpXHJcbiAgICB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3dvcmxkSGVpZ2h0ICogdGhpcy5zY2FsZS55XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBnZXQgY2VudGVyIG9mIHNjcmVlbiBpbiB3b3JsZCBjb29yZGluYXRlc1xyXG4gICAgICogQHR5cGUge1BJWEkuUG9pbnRMaWtlfVxyXG4gICAgICovXHJcbiAgICBnZXQgY2VudGVyKClcclxuICAgIHtcclxuICAgICAgICByZXR1cm4geyB4OiB0aGlzLndvcmxkU2NyZWVuV2lkdGggLyAyIC0gdGhpcy54IC8gdGhpcy5zY2FsZS54LCB5OiB0aGlzLndvcmxkU2NyZWVuSGVpZ2h0IC8gMiAtIHRoaXMueSAvIHRoaXMuc2NhbGUueSB9XHJcbiAgICB9XHJcbiAgICBzZXQgY2VudGVyKHZhbHVlKVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMubW92ZUNlbnRlcih2YWx1ZSlcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIG1vdmUgY2VudGVyIG9mIHZpZXdwb3J0IHRvIHBvaW50XHJcbiAgICAgKiBAcGFyYW0geyhudW1iZXJ8UElYSS5Qb2ludExpa2UpfSB4IG9yIHBvaW50XHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW3ldXHJcbiAgICAgKiBAcmV0dXJuIHtWaWV3cG9ydH0gdGhpc1xyXG4gICAgICovXHJcbiAgICBtb3ZlQ2VudGVyKC8qeCwgeSB8IFBJWEkuUG9pbnQqLylcclxuICAgIHtcclxuICAgICAgICBsZXQgeCwgeVxyXG4gICAgICAgIGlmICghaXNOYU4oYXJndW1lbnRzWzBdKSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHggPSBhcmd1bWVudHNbMF1cclxuICAgICAgICAgICAgeSA9IGFyZ3VtZW50c1sxXVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB4ID0gYXJndW1lbnRzWzBdLnhcclxuICAgICAgICAgICAgeSA9IGFyZ3VtZW50c1swXS55XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMucG9zaXRpb24uc2V0KCh0aGlzLndvcmxkU2NyZWVuV2lkdGggLyAyIC0geCkgKiB0aGlzLnNjYWxlLngsICh0aGlzLndvcmxkU2NyZWVuSGVpZ2h0IC8gMiAtIHkpICogdGhpcy5zY2FsZS55KVxyXG4gICAgICAgIHRoaXMuX3Jlc2V0KClcclxuICAgICAgICByZXR1cm4gdGhpc1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogdG9wLWxlZnQgY29ybmVyXHJcbiAgICAgKiBAdHlwZSB7UElYSS5Qb2ludExpa2V9XHJcbiAgICAgKi9cclxuICAgIGdldCBjb3JuZXIoKVxyXG4gICAge1xyXG4gICAgICAgIHJldHVybiB7IHg6IC10aGlzLnggLyB0aGlzLnNjYWxlLngsIHk6IC10aGlzLnkgLyB0aGlzLnNjYWxlLnkgfVxyXG4gICAgfVxyXG4gICAgc2V0IGNvcm5lcih2YWx1ZSlcclxuICAgIHtcclxuICAgICAgICB0aGlzLm1vdmVDb3JuZXIodmFsdWUpXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBtb3ZlIHZpZXdwb3J0J3MgdG9wLWxlZnQgY29ybmVyOyBhbHNvIGNsYW1wcyBhbmQgcmVzZXRzIGRlY2VsZXJhdGUgYW5kIGJvdW5jZSAoYXMgbmVlZGVkKVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ8UElYSS5Qb2ludH0geHxwb2ludFxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHlcclxuICAgICAqIEByZXR1cm4ge1ZpZXdwb3J0fSB0aGlzXHJcbiAgICAgKi9cclxuICAgIG1vdmVDb3JuZXIoLyp4LCB5IHwgcG9pbnQqLylcclxuICAgIHtcclxuICAgICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMucG9zaXRpb24uc2V0KC1hcmd1bWVudHNbMF0ueCAqIHRoaXMuc2NhbGUueCwgLWFyZ3VtZW50c1swXS55ICogdGhpcy5zY2FsZS55KVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLnBvc2l0aW9uLnNldCgtYXJndW1lbnRzWzBdICogdGhpcy5zY2FsZS54LCAtYXJndW1lbnRzWzFdICogdGhpcy5zY2FsZS55KVxyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl9yZXNldCgpXHJcbiAgICAgICAgcmV0dXJuIHRoaXNcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGNoYW5nZSB6b29tIHNvIHRoZSB3aWR0aCBmaXRzIGluIHRoZSB2aWV3cG9ydFxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFt3aWR0aD10aGlzLl93b3JsZFdpZHRoXSBpbiB3b3JsZCBjb29yZGluYXRlc1xyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbY2VudGVyXSBtYWludGFpbiB0aGUgc2FtZSBjZW50ZXJcclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW3NjYWxlWT10cnVlXSB3aGV0aGVyIHRvIHNldCBzY2FsZVk9c2NhbGVYXHJcbiAgICAgKiBAcmV0dXJuIHtWaWV3cG9ydH0gdGhpc1xyXG4gICAgICovXHJcbiAgICBmaXRXaWR0aCh3aWR0aCwgY2VudGVyLCBzY2FsZVk9dHJ1ZSlcclxuICAgIHtcclxuICAgICAgICBsZXQgc2F2ZVxyXG4gICAgICAgIGlmIChjZW50ZXIpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBzYXZlID0gdGhpcy5jZW50ZXJcclxuICAgICAgICB9XHJcbiAgICAgICAgd2lkdGggPSB3aWR0aCB8fCB0aGlzLndvcmxkV2lkdGhcclxuICAgICAgICB0aGlzLnNjYWxlLnggPSB0aGlzLnNjcmVlbldpZHRoIC8gd2lkdGhcclxuXHJcbiAgICAgICAgaWYgKHNjYWxlWSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMuc2NhbGUueSA9IHRoaXMuc2NhbGUueFxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKGNlbnRlcilcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMubW92ZUNlbnRlcihzYXZlKVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGhpc1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogY2hhbmdlIHpvb20gc28gdGhlIGhlaWdodCBmaXRzIGluIHRoZSB2aWV3cG9ydFxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtoZWlnaHQ9dGhpcy5fd29ybGRIZWlnaHRdIGluIHdvcmxkIGNvb3JkaW5hdGVzXHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtjZW50ZXJdIG1haW50YWluIHRoZSBzYW1lIGNlbnRlciBvZiB0aGUgc2NyZWVuIGFmdGVyIHpvb21cclxuICAgICAqIEBwYXJhbSB7IGJvb2xlYW4gfSBbc2NhbGVYPXRydWVdIHdoZXRoZXIgdG8gc2V0IHNjYWxlWCA9IHNjYWxlWVxyXG4gICAgICogQHJldHVybiB7Vmlld3BvcnR9IHRoaXNcclxuICAgICAqL1xyXG4gICAgZml0SGVpZ2h0KGhlaWdodCwgY2VudGVyLCBzY2FsZVg9dHJ1ZSlcclxuICAgIHtcclxuICAgICAgICBsZXQgc2F2ZVxyXG4gICAgICAgIGlmIChjZW50ZXIpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBzYXZlID0gdGhpcy5jZW50ZXJcclxuICAgICAgICB9XHJcbiAgICAgICAgaGVpZ2h0ID0gaGVpZ2h0IHx8IHRoaXMud29ybGRIZWlnaHRcclxuICAgICAgICB0aGlzLnNjYWxlLnkgPSB0aGlzLnNjcmVlbkhlaWdodCAvIGhlaWdodFxyXG5cclxuICAgICAgICBpZiAoc2NhbGVYKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5zY2FsZS54ID0gdGhpcy5zY2FsZS55XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoY2VudGVyKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5tb3ZlQ2VudGVyKHNhdmUpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0aGlzXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBjaGFuZ2Ugem9vbSBzbyBpdCBmaXRzIHRoZSBlbnRpcmUgd29ybGQgaW4gdGhlIHZpZXdwb3J0XHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtjZW50ZXJdIG1haW50YWluIHRoZSBzYW1lIGNlbnRlciBvZiB0aGUgc2NyZWVuIGFmdGVyIHpvb21cclxuICAgICAqIEByZXR1cm4ge1ZpZXdwb3J0fSB0aGlzXHJcbiAgICAgKi9cclxuICAgIGZpdFdvcmxkKGNlbnRlcilcclxuICAgIHtcclxuICAgICAgICBsZXQgc2F2ZVxyXG4gICAgICAgIGlmIChjZW50ZXIpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBzYXZlID0gdGhpcy5jZW50ZXJcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5zY2FsZS54ID0gdGhpcy5fc2NyZWVuV2lkdGggLyB0aGlzLl93b3JsZFdpZHRoXHJcbiAgICAgICAgdGhpcy5zY2FsZS55ID0gdGhpcy5fc2NyZWVuSGVpZ2h0IC8gdGhpcy5fd29ybGRIZWlnaHRcclxuICAgICAgICBpZiAodGhpcy5zY2FsZS54IDwgdGhpcy5zY2FsZS55KVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5zY2FsZS55ID0gdGhpcy5zY2FsZS54XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2VcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMuc2NhbGUueCA9IHRoaXMuc2NhbGUueVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoY2VudGVyKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5tb3ZlQ2VudGVyKHNhdmUpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0aGlzXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBjaGFuZ2Ugem9vbSBzbyBpdCBmaXRzIHRoZSBzaXplIG9yIHRoZSBlbnRpcmUgd29ybGQgaW4gdGhlIHZpZXdwb3J0XHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtjZW50ZXJdIG1haW50YWluIHRoZSBzYW1lIGNlbnRlciBvZiB0aGUgc2NyZWVuIGFmdGVyIHpvb21cclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbd2lkdGhdIGRlc2lyZWQgd2lkdGhcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbaGVpZ2h0XSBkZXNpcmVkIGhlaWdodFxyXG4gICAgICogQHJldHVybiB7Vmlld3BvcnR9IHRoaXNcclxuICAgICAqL1xyXG4gICAgZml0KGNlbnRlciwgd2lkdGgsIGhlaWdodClcclxuICAgIHtcclxuICAgICAgICBsZXQgc2F2ZVxyXG4gICAgICAgIGlmIChjZW50ZXIpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBzYXZlID0gdGhpcy5jZW50ZXJcclxuICAgICAgICB9XHJcbiAgICAgICAgd2lkdGggPSB3aWR0aCB8fCB0aGlzLndvcmxkV2lkdGhcclxuICAgICAgICBoZWlnaHQgPSBoZWlnaHQgfHwgdGhpcy53b3JsZEhlaWdodFxyXG4gICAgICAgIHRoaXMuc2NhbGUueCA9IHRoaXMuc2NyZWVuV2lkdGggLyB3aWR0aFxyXG4gICAgICAgIHRoaXMuc2NhbGUueSA9IHRoaXMuc2NyZWVuSGVpZ2h0IC8gaGVpZ2h0XHJcbiAgICAgICAgaWYgKHRoaXMuc2NhbGUueCA8IHRoaXMuc2NhbGUueSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMuc2NhbGUueSA9IHRoaXMuc2NhbGUueFxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLnNjYWxlLnggPSB0aGlzLnNjYWxlLnlcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGNlbnRlcilcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMubW92ZUNlbnRlcihzYXZlKVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGhpc1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogem9vbSB2aWV3cG9ydCBieSBhIGNlcnRhaW4gcGVyY2VudCAoaW4gYm90aCB4IGFuZCB5IGRpcmVjdGlvbilcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBwZXJjZW50IGNoYW5nZSAoZS5nLiwgMC4yNSB3b3VsZCBpbmNyZWFzZSBhIHN0YXJ0aW5nIHNjYWxlIG9mIDEuMCB0byAxLjI1KVxyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbY2VudGVyXSBtYWludGFpbiB0aGUgc2FtZSBjZW50ZXIgb2YgdGhlIHNjcmVlbiBhZnRlciB6b29tXHJcbiAgICAgKiBAcmV0dXJuIHtWaWV3cG9ydH0gdGhlIHZpZXdwb3J0XHJcbiAgICAgKi9cclxuICAgIHpvb21QZXJjZW50KHBlcmNlbnQsIGNlbnRlcilcclxuICAgIHtcclxuICAgICAgICBsZXQgc2F2ZVxyXG4gICAgICAgIGlmIChjZW50ZXIpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBzYXZlID0gdGhpcy5jZW50ZXJcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3Qgc2NhbGUgPSB0aGlzLnNjYWxlLnggKyB0aGlzLnNjYWxlLnggKiBwZXJjZW50XHJcbiAgICAgICAgdGhpcy5zY2FsZS5zZXQoc2NhbGUpXHJcbiAgICAgICAgaWYgKGNlbnRlcilcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMubW92ZUNlbnRlcihzYXZlKVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGhpc1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogem9vbSB2aWV3cG9ydCBieSBpbmNyZWFzaW5nL2RlY3JlYXNpbmcgd2lkdGggYnkgYSBjZXJ0YWluIG51bWJlciBvZiBwaXhlbHNcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBjaGFuZ2UgaW4gcGl4ZWxzXHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtjZW50ZXJdIG1haW50YWluIHRoZSBzYW1lIGNlbnRlciBvZiB0aGUgc2NyZWVuIGFmdGVyIHpvb21cclxuICAgICAqIEByZXR1cm4ge1ZpZXdwb3J0fSB0aGUgdmlld3BvcnRcclxuICAgICAqL1xyXG4gICAgem9vbShjaGFuZ2UsIGNlbnRlcilcclxuICAgIHtcclxuICAgICAgICB0aGlzLmZpdFdpZHRoKGNoYW5nZSArIHRoaXMud29ybGRTY3JlZW5XaWR0aCwgY2VudGVyKVxyXG4gICAgICAgIHJldHVybiB0aGlzXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gW29wdGlvbnNdXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMud2lkdGhdIHRoZSBkZXNpcmVkIHdpZHRoIHRvIHNuYXAgKHRvIG1haW50YWluIGFzcGVjdCByYXRpbywgY2hvb3NlIG9ubHkgd2lkdGggb3IgaGVpZ2h0KVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLmhlaWdodF0gdGhlIGRlc2lyZWQgaGVpZ2h0IHRvIHNuYXAgKHRvIG1haW50YWluIGFzcGVjdCByYXRpbywgY2hvb3NlIG9ubHkgd2lkdGggb3IgaGVpZ2h0KVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLnRpbWU9MTAwMF1cclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfGZ1bmN0aW9ufSBbb3B0aW9ucy5lYXNlPWVhc2VJbk91dFNpbmVdIGVhc2UgZnVuY3Rpb24gb3IgbmFtZSAoc2VlIGh0dHA6Ly9lYXNpbmdzLm5ldC8gZm9yIHN1cHBvcnRlZCBuYW1lcylcclxuICAgICAqIEBwYXJhbSB7UElYSS5Qb2ludH0gW29wdGlvbnMuY2VudGVyXSBwbGFjZSB0aGlzIHBvaW50IGF0IGNlbnRlciBkdXJpbmcgem9vbSBpbnN0ZWFkIG9mIGNlbnRlciBvZiB0aGUgdmlld3BvcnRcclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMuaW50ZXJydXB0PXRydWVdIHBhdXNlIHNuYXBwaW5nIHdpdGggYW55IHVzZXIgaW5wdXQgb24gdGhlIHZpZXdwb3J0XHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLnJlbW92ZU9uQ29tcGxldGVdIHJlbW92ZXMgdGhpcyBwbHVnaW4gYWZ0ZXIgc25hcHBpbmcgaXMgY29tcGxldGVcclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMucmVtb3ZlT25JbnRlcnJ1cHRdIHJlbW92ZXMgdGhpcyBwbHVnaW4gaWYgaW50ZXJydXB0ZWQgYnkgYW55IHVzZXIgaW5wdXRcclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMuZm9yY2VTdGFydF0gc3RhcnRzIHRoZSBzbmFwIGltbWVkaWF0ZWx5IHJlZ2FyZGxlc3Mgb2Ygd2hldGhlciB0aGUgdmlld3BvcnQgaXMgYXQgdGhlIGRlc2lyZWQgem9vbVxyXG4gICAgICovXHJcbiAgICBzbmFwWm9vbShvcHRpb25zKVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMucGx1Z2luc1snc25hcC16b29tJ10gPSBuZXcgU25hcFpvb20odGhpcywgb3B0aW9ucylcclxuICAgICAgICB0aGlzLnBsdWdpbnNTb3J0KClcclxuICAgICAgICByZXR1cm4gdGhpc1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqIEB0eXBlZGVmIE91dE9mQm91bmRzXHJcbiAgICAgKiBAdHlwZSB7b2JqZWN0fVxyXG4gICAgICogQHByb3BlcnR5IHtib29sZWFufSBsZWZ0XHJcbiAgICAgKiBAcHJvcGVydHkge2Jvb2xlYW59IHJpZ2h0XHJcbiAgICAgKiBAcHJvcGVydHkge2Jvb2xlYW59IHRvcFxyXG4gICAgICogQHByb3BlcnR5IHtib29sZWFufSBib3R0b21cclxuICAgICAqL1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogaXMgY29udGFpbmVyIG91dCBvZiB3b3JsZCBib3VuZHNcclxuICAgICAqIEByZXR1cm4ge091dE9mQm91bmRzfVxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgT09CKClcclxuICAgIHtcclxuICAgICAgICBjb25zdCByZXN1bHQgPSB7fVxyXG4gICAgICAgIHJlc3VsdC5sZWZ0ID0gdGhpcy5sZWZ0IDwgMFxyXG4gICAgICAgIHJlc3VsdC5yaWdodCA9IHRoaXMucmlnaHQgPiB0aGlzLl93b3JsZFdpZHRoXHJcbiAgICAgICAgcmVzdWx0LnRvcCA9IHRoaXMudG9wIDwgMFxyXG4gICAgICAgIHJlc3VsdC5ib3R0b20gPSB0aGlzLmJvdHRvbSA+IHRoaXMuX3dvcmxkSGVpZ2h0XHJcbiAgICAgICAgcmVzdWx0LmNvcm5lclBvaW50ID0ge1xyXG4gICAgICAgICAgICB4OiB0aGlzLl93b3JsZFdpZHRoICogdGhpcy5zY2FsZS54IC0gdGhpcy5fc2NyZWVuV2lkdGgsXHJcbiAgICAgICAgICAgIHk6IHRoaXMuX3dvcmxkSGVpZ2h0ICogdGhpcy5zY2FsZS55IC0gdGhpcy5fc2NyZWVuSGVpZ2h0XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiByZXN1bHRcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIHdvcmxkIGNvb3JkaW5hdGVzIG9mIHRoZSByaWdodCBlZGdlIG9mIHRoZSBzY3JlZW5cclxuICAgICAqIEB0eXBlIHtudW1iZXJ9XHJcbiAgICAgKi9cclxuICAgIGdldCByaWdodCgpXHJcbiAgICB7XHJcbiAgICAgICAgcmV0dXJuIC10aGlzLnggLyB0aGlzLnNjYWxlLnggKyB0aGlzLndvcmxkU2NyZWVuV2lkdGhcclxuICAgIH1cclxuICAgIHNldCByaWdodCh2YWx1ZSlcclxuICAgIHtcclxuICAgICAgICB0aGlzLnggPSAtdmFsdWUgKiB0aGlzLnNjYWxlLnggKyB0aGlzLnNjcmVlbldpZHRoXHJcbiAgICAgICAgdGhpcy5fcmVzZXQoKVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogd29ybGQgY29vcmRpbmF0ZXMgb2YgdGhlIGxlZnQgZWRnZSBvZiB0aGUgc2NyZWVuXHJcbiAgICAgKiBAdHlwZSB7bnVtYmVyfVxyXG4gICAgICovXHJcbiAgICBnZXQgbGVmdCgpXHJcbiAgICB7XHJcbiAgICAgICAgcmV0dXJuIC10aGlzLnggLyB0aGlzLnNjYWxlLnhcclxuICAgIH1cclxuICAgIHNldCBsZWZ0KHZhbHVlKVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMueCA9IC12YWx1ZSAqIHRoaXMuc2NhbGUueFxyXG4gICAgICAgIHRoaXMuX3Jlc2V0KClcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIHdvcmxkIGNvb3JkaW5hdGVzIG9mIHRoZSB0b3AgZWRnZSBvZiB0aGUgc2NyZWVuXHJcbiAgICAgKiBAdHlwZSB7bnVtYmVyfVxyXG4gICAgICovXHJcbiAgICBnZXQgdG9wKClcclxuICAgIHtcclxuICAgICAgICByZXR1cm4gLXRoaXMueSAvIHRoaXMuc2NhbGUueVxyXG4gICAgfVxyXG4gICAgc2V0IHRvcCh2YWx1ZSlcclxuICAgIHtcclxuICAgICAgICB0aGlzLnkgPSAtdmFsdWUgKiB0aGlzLnNjYWxlLnlcclxuICAgICAgICB0aGlzLl9yZXNldCgpXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiB3b3JsZCBjb29yZGluYXRlcyBvZiB0aGUgYm90dG9tIGVkZ2Ugb2YgdGhlIHNjcmVlblxyXG4gICAgICogQHR5cGUge251bWJlcn1cclxuICAgICAqL1xyXG4gICAgZ2V0IGJvdHRvbSgpXHJcbiAgICB7XHJcbiAgICAgICAgcmV0dXJuIC10aGlzLnkgLyB0aGlzLnNjYWxlLnkgKyB0aGlzLndvcmxkU2NyZWVuSGVpZ2h0XHJcbiAgICB9XHJcbiAgICBzZXQgYm90dG9tKHZhbHVlKVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMueSA9IC12YWx1ZSAqIHRoaXMuc2NhbGUueSArIHRoaXMuc2NyZWVuSGVpZ2h0XHJcbiAgICAgICAgdGhpcy5fcmVzZXQoKVxyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiBkZXRlcm1pbmVzIHdoZXRoZXIgdGhlIHZpZXdwb3J0IGlzIGRpcnR5IChpLmUuLCBuZWVkcyB0byBiZSByZW5kZXJlcmVkIHRvIHRoZSBzY3JlZW4gYmVjYXVzZSBvZiBhIGNoYW5nZSlcclxuICAgICAqIEB0eXBlIHtib29sZWFufVxyXG4gICAgICovXHJcbiAgICBnZXQgZGlydHkoKVxyXG4gICAge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9kaXJ0eVxyXG4gICAgfVxyXG4gICAgc2V0IGRpcnR5KHZhbHVlKVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMuX2RpcnR5ID0gdmFsdWVcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIHBlcm1hbmVudGx5IGNoYW5nZXMgdGhlIFZpZXdwb3J0J3MgaGl0QXJlYVxyXG4gICAgICogPHA+Tk9URTogbm9ybWFsbHkgdGhlIGhpdEFyZWEgPSBQSVhJLlJlY3RhbmdsZShWaWV3cG9ydC5sZWZ0LCBWaWV3cG9ydC50b3AsIFZpZXdwb3J0LndvcmxkU2NyZWVuV2lkdGgsIFZpZXdwb3J0LndvcmxkU2NyZWVuSGVpZ2h0KTwvcD5cclxuICAgICAqIEB0eXBlIHsoUElYSS5SZWN0YW5nbGV8UElYSS5DaXJjbGV8UElYSS5FbGxpcHNlfFBJWEkuUG9seWdvbnxQSVhJLlJvdW5kZWRSZWN0YW5nbGUpfVxyXG4gICAgICovXHJcbiAgICBnZXQgZm9yY2VIaXRBcmVhKClcclxuICAgIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fZm9yY2VIaXRBcmVhXHJcbiAgICB9XHJcbiAgICBzZXQgZm9yY2VIaXRBcmVhKHZhbHVlKVxyXG4gICAge1xyXG4gICAgICAgIGlmICh2YWx1ZSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMuX2ZvcmNlSGl0QXJlYSA9IHZhbHVlXHJcbiAgICAgICAgICAgIHRoaXMuaGl0QXJlYSA9IHZhbHVlXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2VcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMuX2ZvcmNlSGl0QXJlYSA9IGZhbHNlXHJcbiAgICAgICAgICAgIHRoaXMuaGl0QXJlYSA9IG5ldyBQSVhJLlJlY3RhbmdsZSgwLCAwLCB0aGlzLndvcmxkV2lkdGgsIHRoaXMud29ybGRIZWlnaHQpXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogY291bnQgb2YgbW91c2UvdG91Y2ggcG9pbnRlcnMgdGhhdCBhcmUgZG93biBvbiB0aGUgdmlld3BvcnRcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKiBAcmV0dXJuIHtudW1iZXJ9XHJcbiAgICAgKi9cclxuICAgIGNvdW50RG93blBvaW50ZXJzKClcclxuICAgIHtcclxuICAgICAgICByZXR1cm4gKHRoaXMubGVmdERvd24gPyAxIDogMCkgKyB0aGlzLnRvdWNoZXMubGVuZ3RoXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBhcnJheSBvZiB0b3VjaCBwb2ludGVycyB0aGF0IGFyZSBkb3duIG9uIHRoZSB2aWV3cG9ydFxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqIEByZXR1cm4ge1BJWEkuSW50ZXJhY3Rpb25UcmFja2luZ0RhdGFbXX1cclxuICAgICAqL1xyXG4gICAgZ2V0VG91Y2hQb2ludGVycygpXHJcbiAgICB7XHJcbiAgICAgICAgY29uc3QgcmVzdWx0cyA9IFtdXHJcbiAgICAgICAgY29uc3QgcG9pbnRlcnMgPSB0aGlzLnRyYWNrZWRQb2ludGVyc1xyXG4gICAgICAgIGZvciAobGV0IGtleSBpbiBwb2ludGVycylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGNvbnN0IHBvaW50ZXIgPSBwb2ludGVyc1trZXldXHJcbiAgICAgICAgICAgIGlmICh0aGlzLnRvdWNoZXMuaW5kZXhPZihwb2ludGVyLnBvaW50ZXJJZCkgIT09IC0xKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICByZXN1bHRzLnB1c2gocG9pbnRlcilcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gcmVzdWx0c1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogYXJyYXkgb2YgcG9pbnRlcnMgdGhhdCBhcmUgZG93biBvbiB0aGUgdmlld3BvcnRcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKiBAcmV0dXJuIHtQSVhJLkludGVyYWN0aW9uVHJhY2tpbmdEYXRhW119XHJcbiAgICAgKi9cclxuICAgIGdldFBvaW50ZXJzKClcclxuICAgIHtcclxuICAgICAgICBjb25zdCByZXN1bHRzID0gW11cclxuICAgICAgICBjb25zdCBwb2ludGVycyA9IHRoaXMudHJhY2tlZFBvaW50ZXJzXHJcbiAgICAgICAgZm9yIChsZXQga2V5IGluIHBvaW50ZXJzKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgcmVzdWx0cy5wdXNoKHBvaW50ZXJzW2tleV0pXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiByZXN1bHRzXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBjbGFtcHMgYW5kIHJlc2V0cyBib3VuY2UgYW5kIGRlY2VsZXJhdGUgKGFzIG5lZWRlZCkgYWZ0ZXIgbWFudWFsbHkgbW92aW5nIHZpZXdwb3J0XHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBfcmVzZXQoKVxyXG4gICAge1xyXG4gICAgICAgIGlmICh0aGlzLnBsdWdpbnNbJ2JvdW5jZSddKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5wbHVnaW5zWydib3VuY2UnXS5yZXNldCgpXHJcbiAgICAgICAgICAgIHRoaXMucGx1Z2luc1snYm91bmNlJ10uYm91bmNlKClcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRoaXMucGx1Z2luc1snZGVjZWxlcmF0ZSddKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5wbHVnaW5zWydkZWNlbGVyYXRlJ10ucmVzZXQoKVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGhpcy5wbHVnaW5zWydzbmFwJ10pXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLnBsdWdpbnNbJ3NuYXAnXS5yZXNldCgpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aGlzLnBsdWdpbnNbJ2NsYW1wJ10pXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLnBsdWdpbnNbJ2NsYW1wJ10udXBkYXRlKClcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRoaXMucGx1Z2luc1snY2xhbXAtem9vbSddKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5wbHVnaW5zWydjbGFtcC16b29tJ10uY2xhbXAoKVxyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmRpcnR5ID0gdHJ1ZVxyXG4gICAgfVxyXG5cclxuICAgIC8vIFBMVUdJTlNcclxuXHJcbiAgICAvKipcclxuICAgICAqIHJlbW92ZXMgaW5zdGFsbGVkIHBsdWdpblxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHR5cGUgb2YgcGx1Z2luIChlLmcuLCAnZHJhZycsICdwaW5jaCcpXHJcbiAgICAgKi9cclxuICAgIHJlbW92ZVBsdWdpbih0eXBlKVxyXG4gICAge1xyXG4gICAgICAgIGlmICh0aGlzLnBsdWdpbnNbdHlwZV0pXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLnBsdWdpbnNbdHlwZV0gPSBudWxsXHJcbiAgICAgICAgICAgIHRoaXMuZW1pdCh0eXBlICsgJy1yZW1vdmUnKVxyXG4gICAgICAgICAgICB0aGlzLnBsdWdpbnNTb3J0KClcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBwYXVzZSBwbHVnaW5cclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSB0eXBlIG9mIHBsdWdpbiAoZS5nLiwgJ2RyYWcnLCAncGluY2gnKVxyXG4gICAgICovXHJcbiAgICBwYXVzZVBsdWdpbih0eXBlKVxyXG4gICAge1xyXG4gICAgICAgIGlmICh0aGlzLnBsdWdpbnNbdHlwZV0pXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLnBsdWdpbnNbdHlwZV0ucGF1c2UoKVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIHJlc3VtZSBwbHVnaW5cclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSB0eXBlIG9mIHBsdWdpbiAoZS5nLiwgJ2RyYWcnLCAncGluY2gnKVxyXG4gICAgICovXHJcbiAgICByZXN1bWVQbHVnaW4odHlwZSlcclxuICAgIHtcclxuICAgICAgICBpZiAodGhpcy5wbHVnaW5zW3R5cGVdKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5wbHVnaW5zW3R5cGVdLnJlc3VtZSgpXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogc29ydCBwbHVnaW5zIGZvciB1cGRhdGVzXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBwbHVnaW5zU29ydCgpXHJcbiAgICB7XHJcbiAgICAgICAgdGhpcy5wbHVnaW5zTGlzdCA9IFtdXHJcbiAgICAgICAgZm9yIChsZXQgcGx1Z2luIG9mIFBMVUdJTl9PUkRFUilcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLnBsdWdpbnNbcGx1Z2luXSlcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wbHVnaW5zTGlzdC5wdXNoKHRoaXMucGx1Z2luc1twbHVnaW5dKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogZW5hYmxlIG9uZS1maW5nZXIgdG91Y2ggdG8gZHJhZ1xyXG4gICAgICogQHBhcmFtIHtvYmplY3R9IFtvcHRpb25zXVxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IFtvcHRpb25zLmRpcmVjdGlvbj1hbGxdIGRpcmVjdGlvbiB0byBkcmFnIChhbGwsIHgsIG9yIHkpXHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLndoZWVsPXRydWVdIHVzZSB3aGVlbCB0byBzY3JvbGwgaW4geSBkaXJlY3Rpb24gKHVubGVzcyB3aGVlbCBwbHVnaW4gaXMgYWN0aXZlKVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLndoZWVsU2Nyb2xsPTEwXSBudW1iZXIgb2YgcGl4ZWxzIHRvIHNjcm9sbCB3aXRoIGVhY2ggd2hlZWwgc3BpblxyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy5yZXZlcnNlXSByZXZlcnNlIHRoZSBkaXJlY3Rpb24gb2YgdGhlIHdoZWVsIHNjcm9sbFxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IFtvcHRpb25zLnVuZGVyZmxvdz1jZW50ZXJdICh0b3AvYm90dG9tL2NlbnRlciBhbmQgbGVmdC9yaWdodC9jZW50ZXIsIG9yIGNlbnRlcikgd2hlcmUgdG8gcGxhY2Ugd29ybGQgaWYgdG9vIHNtYWxsIGZvciBzY3JlZW5cclxuICAgICAqL1xyXG4gICAgZHJhZyhvcHRpb25zKVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMucGx1Z2luc1snZHJhZyddID0gbmV3IERyYWcodGhpcywgb3B0aW9ucylcclxuICAgICAgICB0aGlzLnBsdWdpbnNTb3J0KClcclxuICAgICAgICByZXR1cm4gdGhpc1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogY2xhbXAgdG8gd29ybGQgYm91bmRhcmllcyBvciBvdGhlciBwcm92aWRlZCBib3VuZGFyaWVzXHJcbiAgICAgKiBOT1RFUzpcclxuICAgICAqICAgY2xhbXAgaXMgZGlzYWJsZWQgaWYgY2FsbGVkIHdpdGggbm8gb3B0aW9uczsgdXNlIHsgZGlyZWN0aW9uOiAnYWxsJyB9IGZvciBhbGwgZWRnZSBjbGFtcGluZ1xyXG4gICAgICogICBzY3JlZW5XaWR0aCwgc2NyZWVuSGVpZ2h0LCB3b3JsZFdpZHRoLCBhbmQgd29ybGRIZWlnaHQgbmVlZHMgdG8gYmUgc2V0IGZvciB0aGlzIHRvIHdvcmsgcHJvcGVybHlcclxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBbb3B0aW9uc11cclxuICAgICAqIEBwYXJhbSB7KG51bWJlcnxib29sZWFuKX0gW29wdGlvbnMubGVmdF0gY2xhbXAgbGVmdDsgdHJ1ZT0wXHJcbiAgICAgKiBAcGFyYW0geyhudW1iZXJ8Ym9vbGVhbil9IFtvcHRpb25zLnJpZ2h0XSBjbGFtcCByaWdodDsgdHJ1ZT12aWV3cG9ydC53b3JsZFdpZHRoXHJcbiAgICAgKiBAcGFyYW0geyhudW1iZXJ8Ym9vbGVhbil9IFtvcHRpb25zLnRvcF0gY2xhbXAgdG9wOyB0cnVlPTBcclxuICAgICAqIEBwYXJhbSB7KG51bWJlcnxib29sZWFuKX0gW29wdGlvbnMuYm90dG9tXSBjbGFtcCBib3R0b207IHRydWU9dmlld3BvcnQud29ybGRIZWlnaHRcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbb3B0aW9ucy5kaXJlY3Rpb25dIChhbGwsIHgsIG9yIHkpIHVzaW5nIGNsYW1wcyBvZiBbMCwgdmlld3BvcnQud29ybGRXaWR0aC92aWV3cG9ydC53b3JsZEhlaWdodF07IHJlcGxhY2VzIGxlZnQvcmlnaHQvdG9wL2JvdHRvbSBpZiBzZXRcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbb3B0aW9ucy51bmRlcmZsb3c9Y2VudGVyXSAodG9wL2JvdHRvbS9jZW50ZXIgYW5kIGxlZnQvcmlnaHQvY2VudGVyLCBvciBjZW50ZXIpIHdoZXJlIHRvIHBsYWNlIHdvcmxkIGlmIHRvbyBzbWFsbCBmb3Igc2NyZWVuXHJcbiAgICAgKiBAcmV0dXJuIHtWaWV3cG9ydH0gdGhpc1xyXG4gICAgICovXHJcbiAgICBjbGFtcChvcHRpb25zKVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMucGx1Z2luc1snY2xhbXAnXSA9IG5ldyBDbGFtcCh0aGlzLCBvcHRpb25zKVxyXG4gICAgICAgIHRoaXMucGx1Z2luc1NvcnQoKVxyXG4gICAgICAgIHJldHVybiB0aGlzXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBkZWNlbGVyYXRlIGFmdGVyIGEgbW92ZVxyXG4gICAgICogQHBhcmFtIHtvYmplY3R9IFtvcHRpb25zXVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLmZyaWN0aW9uPTAuOTVdIHBlcmNlbnQgdG8gZGVjZWxlcmF0ZSBhZnRlciBtb3ZlbWVudFxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLmJvdW5jZT0wLjhdIHBlcmNlbnQgdG8gZGVjZWxlcmF0ZSB3aGVuIHBhc3QgYm91bmRhcmllcyAob25seSBhcHBsaWNhYmxlIHdoZW4gdmlld3BvcnQuYm91bmNlKCkgaXMgYWN0aXZlKVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLm1pblNwZWVkPTAuMDFdIG1pbmltdW0gdmVsb2NpdHkgYmVmb3JlIHN0b3BwaW5nL3JldmVyc2luZyBhY2NlbGVyYXRpb25cclxuICAgICAqIEByZXR1cm4ge1ZpZXdwb3J0fSB0aGlzXHJcbiAgICAgKi9cclxuICAgIGRlY2VsZXJhdGUob3B0aW9ucylcclxuICAgIHtcclxuICAgICAgICB0aGlzLnBsdWdpbnNbJ2RlY2VsZXJhdGUnXSA9IG5ldyBEZWNlbGVyYXRlKHRoaXMsIG9wdGlvbnMpXHJcbiAgICAgICAgdGhpcy5wbHVnaW5zU29ydCgpXHJcbiAgICAgICAgcmV0dXJuIHRoaXNcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGJvdW5jZSBvbiBib3JkZXJzXHJcbiAgICAgKiBOT1RFOiBzY3JlZW5XaWR0aCwgc2NyZWVuSGVpZ2h0LCB3b3JsZFdpZHRoLCBhbmQgd29ybGRIZWlnaHQgbmVlZHMgdG8gYmUgc2V0IGZvciB0aGlzIHRvIHdvcmsgcHJvcGVybHlcclxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBbb3B0aW9uc11cclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbb3B0aW9ucy5zaWRlcz1hbGxdIGFsbCwgaG9yaXpvbnRhbCwgdmVydGljYWwsIG9yIGNvbWJpbmF0aW9uIG9mIHRvcCwgYm90dG9tLCByaWdodCwgbGVmdCAoZS5nLiwgJ3RvcC1ib3R0b20tcmlnaHQnKVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLmZyaWN0aW9uPTAuNV0gZnJpY3Rpb24gdG8gYXBwbHkgdG8gZGVjZWxlcmF0ZSBpZiBhY3RpdmVcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy50aW1lPTE1MF0gdGltZSBpbiBtcyB0byBmaW5pc2ggYm91bmNlXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ3xmdW5jdGlvbn0gW29wdGlvbnMuZWFzZT1lYXNlSW5PdXRTaW5lXSBlYXNlIGZ1bmN0aW9uIG9yIG5hbWUgKHNlZSBodHRwOi8vZWFzaW5ncy5uZXQvIGZvciBzdXBwb3J0ZWQgbmFtZXMpXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gW29wdGlvbnMudW5kZXJmbG93PWNlbnRlcl0gKHRvcC9ib3R0b20vY2VudGVyIGFuZCBsZWZ0L3JpZ2h0L2NlbnRlciwgb3IgY2VudGVyKSB3aGVyZSB0byBwbGFjZSB3b3JsZCBpZiB0b28gc21hbGwgZm9yIHNjcmVlblxyXG4gICAgICogQHJldHVybiB7Vmlld3BvcnR9IHRoaXNcclxuICAgICAqL1xyXG4gICAgYm91bmNlKG9wdGlvbnMpXHJcbiAgICB7XHJcbiAgICAgICAgdGhpcy5wbHVnaW5zWydib3VuY2UnXSA9IG5ldyBCb3VuY2UodGhpcywgb3B0aW9ucylcclxuICAgICAgICB0aGlzLnBsdWdpbnNTb3J0KClcclxuICAgICAgICByZXR1cm4gdGhpc1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogZW5hYmxlIHBpbmNoIHRvIHpvb20gYW5kIHR3by1maW5nZXIgdG91Y2ggdG8gZHJhZ1xyXG4gICAgICogTk9URTogc2NyZWVuV2lkdGgsIHNjcmVlbkhlaWdodCwgd29ybGRXaWR0aCwgYW5kIHdvcmxkSGVpZ2h0IG5lZWRzIHRvIGJlIHNldCBmb3IgdGhpcyB0byB3b3JrIHByb3Blcmx5XHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMucGVyY2VudD0xLjBdIHBlcmNlbnQgdG8gbW9kaWZ5IHBpbmNoIHNwZWVkXHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLm5vRHJhZ10gZGlzYWJsZSB0d28tZmluZ2VyIGRyYWdnaW5nXHJcbiAgICAgKiBAcGFyYW0ge1BJWEkuUG9pbnR9IFtvcHRpb25zLmNlbnRlcl0gcGxhY2UgdGhpcyBwb2ludCBhdCBjZW50ZXIgZHVyaW5nIHpvb20gaW5zdGVhZCBvZiBjZW50ZXIgb2YgdHdvIGZpbmdlcnNcclxuICAgICAqIEByZXR1cm4ge1ZpZXdwb3J0fSB0aGlzXHJcbiAgICAgKi9cclxuICAgIHBpbmNoKG9wdGlvbnMpXHJcbiAgICB7XHJcbiAgICAgICAgdGhpcy5wbHVnaW5zWydwaW5jaCddID0gbmV3IFBpbmNoKHRoaXMsIG9wdGlvbnMpXHJcbiAgICAgICAgdGhpcy5wbHVnaW5zU29ydCgpXHJcbiAgICAgICAgcmV0dXJuIHRoaXNcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIHNuYXAgdG8gYSBwb2ludFxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHhcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB5XHJcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gW29wdGlvbnNdXHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLnRvcExlZnRdIHNuYXAgdG8gdGhlIHRvcC1sZWZ0IG9mIHZpZXdwb3J0IGluc3RlYWQgb2YgY2VudGVyXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMuZnJpY3Rpb249MC44XSBmcmljdGlvbi9mcmFtZSB0byBhcHBseSBpZiBkZWNlbGVyYXRlIGlzIGFjdGl2ZVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLnRpbWU9MTAwMF1cclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfGZ1bmN0aW9ufSBbb3B0aW9ucy5lYXNlPWVhc2VJbk91dFNpbmVdIGVhc2UgZnVuY3Rpb24gb3IgbmFtZSAoc2VlIGh0dHA6Ly9lYXNpbmdzLm5ldC8gZm9yIHN1cHBvcnRlZCBuYW1lcylcclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMuaW50ZXJydXB0PXRydWVdIHBhdXNlIHNuYXBwaW5nIHdpdGggYW55IHVzZXIgaW5wdXQgb24gdGhlIHZpZXdwb3J0XHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLnJlbW92ZU9uQ29tcGxldGVdIHJlbW92ZXMgdGhpcyBwbHVnaW4gYWZ0ZXIgc25hcHBpbmcgaXMgY29tcGxldGVcclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMucmVtb3ZlT25JbnRlcnJ1cHRdIHJlbW92ZXMgdGhpcyBwbHVnaW4gaWYgaW50ZXJydXB0ZWQgYnkgYW55IHVzZXIgaW5wdXRcclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMuZm9yY2VTdGFydF0gc3RhcnRzIHRoZSBzbmFwIGltbWVkaWF0ZWx5IHJlZ2FyZGxlc3Mgb2Ygd2hldGhlciB0aGUgdmlld3BvcnQgaXMgYXQgdGhlIGRlc2lyZWQgbG9jYXRpb25cclxuICogQHJldHVybiB7Vmlld3BvcnR9IHRoaXNcclxuICAgICAqL1xyXG4gICAgc25hcCh4LCB5LCBvcHRpb25zKVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMucGx1Z2luc1snc25hcCddID0gbmV3IFNuYXAodGhpcywgeCwgeSwgb3B0aW9ucylcclxuICAgICAgICB0aGlzLnBsdWdpbnNTb3J0KClcclxuICAgICAgICByZXR1cm4gdGhpc1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogZm9sbG93IGEgdGFyZ2V0XHJcbiAgICAgKiBAcGFyYW0ge1BJWEkuRGlzcGxheU9iamVjdH0gdGFyZ2V0IHRvIGZvbGxvdyAob2JqZWN0IG11c3QgaW5jbHVkZSB7eDogeC1jb29yZGluYXRlLCB5OiB5LWNvb3JkaW5hdGV9KVxyXG4gICAgICogQHBhcmFtIHtvYmplY3R9IFtvcHRpb25zXVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLnNwZWVkPTBdIHRvIGZvbGxvdyBpbiBwaXhlbHMvZnJhbWUgKDA9dGVsZXBvcnQgdG8gbG9jYXRpb24pXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMucmFkaXVzXSByYWRpdXMgKGluIHdvcmxkIGNvb3JkaW5hdGVzKSBvZiBjZW50ZXIgY2lyY2xlIHdoZXJlIG1vdmVtZW50IGlzIGFsbG93ZWQgd2l0aG91dCBtb3ZpbmcgdGhlIHZpZXdwb3J0XHJcbiAgICAgKiBAcmV0dXJuIHtWaWV3cG9ydH0gdGhpc1xyXG4gICAgICovXHJcbiAgICBmb2xsb3codGFyZ2V0LCBvcHRpb25zKVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMucGx1Z2luc1snZm9sbG93J10gPSBuZXcgRm9sbG93KHRoaXMsIHRhcmdldCwgb3B0aW9ucylcclxuICAgICAgICB0aGlzLnBsdWdpbnNTb3J0KClcclxuICAgICAgICByZXR1cm4gdGhpc1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogem9vbSB1c2luZyBtb3VzZSB3aGVlbFxyXG4gICAgICogQHBhcmFtIHtvYmplY3R9IFtvcHRpb25zXVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLnBlcmNlbnQ9MC4xXSBwZXJjZW50IHRvIHNjcm9sbCB3aXRoIGVhY2ggc3BpblxyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy5yZXZlcnNlXSByZXZlcnNlIHRoZSBkaXJlY3Rpb24gb2YgdGhlIHNjcm9sbFxyXG4gICAgICogQHBhcmFtIHtQSVhJLlBvaW50fSBbb3B0aW9ucy5jZW50ZXJdIHBsYWNlIHRoaXMgcG9pbnQgYXQgY2VudGVyIGR1cmluZyB6b29tIGluc3RlYWQgb2YgY3VycmVudCBtb3VzZSBwb3NpdGlvblxyXG4gICAgICogQHJldHVybiB7Vmlld3BvcnR9IHRoaXNcclxuICAgICAqL1xyXG4gICAgd2hlZWwob3B0aW9ucylcclxuICAgIHtcclxuICAgICAgICB0aGlzLnBsdWdpbnNbJ3doZWVsJ10gPSBuZXcgV2hlZWwodGhpcywgb3B0aW9ucylcclxuICAgICAgICB0aGlzLnBsdWdpbnNTb3J0KClcclxuICAgICAgICByZXR1cm4gdGhpc1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogZW5hYmxlIGNsYW1waW5nIG9mIHpvb20gdG8gY29uc3RyYWludHNcclxuICAgICAqIE5PVEU6IHNjcmVlbldpZHRoLCBzY3JlZW5IZWlnaHQsIHdvcmxkV2lkdGgsIGFuZCB3b3JsZEhlaWdodCBuZWVkcyB0byBiZSBzZXQgZm9yIHRoaXMgdG8gd29yayBwcm9wZXJseVxyXG4gICAgICogQHBhcmFtIHtvYmplY3R9IFtvcHRpb25zXVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLm1pbldpZHRoXSBtaW5pbXVtIHdpZHRoXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMubWluSGVpZ2h0XSBtaW5pbXVtIGhlaWdodFxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLm1heFdpZHRoXSBtYXhpbXVtIHdpZHRoXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMubWF4SGVpZ2h0XSBtYXhpbXVtIGhlaWdodFxyXG4gICAgICogQHJldHVybiB7Vmlld3BvcnR9IHRoaXNcclxuICAgICAqL1xyXG4gICAgY2xhbXBab29tKG9wdGlvbnMpXHJcbiAgICB7XHJcbiAgICAgICAgdGhpcy5wbHVnaW5zWydjbGFtcC16b29tJ10gPSBuZXcgQ2xhbXBab29tKHRoaXMsIG9wdGlvbnMpXHJcbiAgICAgICAgdGhpcy5wbHVnaW5zU29ydCgpXHJcbiAgICAgICAgcmV0dXJuIHRoaXNcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFNjcm9sbCB2aWV3cG9ydCB3aGVuIG1vdXNlIGhvdmVycyBuZWFyIG9uZSBvZiB0aGUgZWRnZXMgb3IgcmFkaXVzLWRpc3RhbmNlIGZyb20gY2VudGVyIG9mIHNjcmVlbi5cclxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBbb3B0aW9uc11cclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy5yYWRpdXNdIGRpc3RhbmNlIGZyb20gY2VudGVyIG9mIHNjcmVlbiBpbiBzY3JlZW4gcGl4ZWxzXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMuZGlzdGFuY2VdIGRpc3RhbmNlIGZyb20gYWxsIHNpZGVzIGluIHNjcmVlbiBwaXhlbHNcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy50b3BdIGFsdGVybmF0aXZlbHksIHNldCB0b3AgZGlzdGFuY2UgKGxlYXZlIHVuc2V0IGZvciBubyB0b3Agc2Nyb2xsKVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLmJvdHRvbV0gYWx0ZXJuYXRpdmVseSwgc2V0IGJvdHRvbSBkaXN0YW5jZSAobGVhdmUgdW5zZXQgZm9yIG5vIHRvcCBzY3JvbGwpXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMubGVmdF0gYWx0ZXJuYXRpdmVseSwgc2V0IGxlZnQgZGlzdGFuY2UgKGxlYXZlIHVuc2V0IGZvciBubyB0b3Agc2Nyb2xsKVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLnJpZ2h0XSBhbHRlcm5hdGl2ZWx5LCBzZXQgcmlnaHQgZGlzdGFuY2UgKGxlYXZlIHVuc2V0IGZvciBubyB0b3Agc2Nyb2xsKVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLnNwZWVkPThdIHNwZWVkIGluIHBpeGVscy9mcmFtZSB0byBzY3JvbGwgdmlld3BvcnRcclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMucmV2ZXJzZV0gcmV2ZXJzZSBkaXJlY3Rpb24gb2Ygc2Nyb2xsXHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLm5vRGVjZWxlcmF0ZV0gZG9uJ3QgdXNlIGRlY2VsZXJhdGUgcGx1Z2luIGV2ZW4gaWYgaXQncyBpbnN0YWxsZWRcclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMubGluZWFyXSBpZiB1c2luZyByYWRpdXMsIHVzZSBsaW5lYXIgbW92ZW1lbnQgKCsvLSAxLCArLy0gMSkgaW5zdGVhZCBvZiBhbmdsZWQgbW92ZW1lbnQgKE1hdGguY29zKGFuZ2xlIGZyb20gY2VudGVyKSwgTWF0aC5zaW4oYW5nbGUgZnJvbSBjZW50ZXIpKVxyXG4gICAgICovXHJcbiAgICBtb3VzZUVkZ2VzKG9wdGlvbnMpXHJcbiAgICB7XHJcbiAgICAgICAgdGhpcy5wbHVnaW5zWydtb3VzZS1lZGdlcyddID0gbmV3IE1vdXNlRWRnZXModGhpcywgb3B0aW9ucylcclxuICAgICAgICB0aGlzLnBsdWdpbnNTb3J0KClcclxuICAgICAgICByZXR1cm4gdGhpc1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogcGF1c2Ugdmlld3BvcnQgKGluY2x1ZGluZyBhbmltYXRpb24gdXBkYXRlcyBzdWNoIGFzIGRlY2VsZXJhdGUpXHJcbiAgICAgKiBOT1RFOiB3aGVuIHNldHRpbmcgcGF1c2U9dHJ1ZSwgYWxsIHRvdWNoZXMgYW5kIG1vdXNlIGFjdGlvbnMgYXJlIGNsZWFyZWQgKGkuZS4sIGlmIG1vdXNlZG93biB3YXMgYWN0aXZlLCBpdCBiZWNvbWVzIGluYWN0aXZlIGZvciBwdXJwb3NlcyBvZiB0aGUgdmlld3BvcnQpXHJcbiAgICAgKiBAdHlwZSB7Ym9vbGVhbn1cclxuICAgICAqL1xyXG4gICAgZ2V0IHBhdXNlKCkgeyByZXR1cm4gdGhpcy5fcGF1c2UgfVxyXG4gICAgc2V0IHBhdXNlKHZhbHVlKVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMuX3BhdXNlID0gdmFsdWVcclxuICAgICAgICBpZiAodmFsdWUpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLnRvdWNoZXMgPSBbXVxyXG4gICAgICAgICAgICB0aGlzLmxlZnREb3duID0gZmFsc2VcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBmaXJlcyBhZnRlciBhIG1vdXNlIG9yIHRvdWNoIGNsaWNrXHJcbiAqIEBldmVudCBWaWV3cG9ydCNjbGlja2VkXHJcbiAqIEB0eXBlIHtvYmplY3R9XHJcbiAqIEBwcm9wZXJ0eSB7UElYSS5Qb2ludExpa2V9IHNjcmVlblxyXG4gKiBAcHJvcGVydHkge1BJWEkuUG9pbnRMaWtlfSB3b3JsZFxyXG4gKiBAcHJvcGVydHkge1ZpZXdwb3J0fSB2aWV3cG9ydFxyXG4gKi9cclxuXHJcbi8qKlxyXG4gKiBmaXJlcyB3aGVuIGEgZHJhZyBzdGFydHNcclxuICogQGV2ZW50IFZpZXdwb3J0I2RyYWctc3RhcnRcclxuICogQHR5cGUge29iamVjdH1cclxuICogQHByb3BlcnR5IHtQSVhJLlBvaW50TGlrZX0gc2NyZWVuXHJcbiAqIEBwcm9wZXJ0eSB7UElYSS5Qb2ludExpa2V9IHdvcmxkXHJcbiAqIEBwcm9wZXJ0eSB7Vmlld3BvcnR9IHZpZXdwb3J0XHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqIGZpcmVzIHdoZW4gYSBkcmFnIGVuZHNcclxuICogQGV2ZW50IFZpZXdwb3J0I2RyYWctZW5kXHJcbiAqIEB0eXBlIHtvYmplY3R9XHJcbiAqIEBwcm9wZXJ0eSB7UElYSS5Qb2ludExpa2V9IHNjcmVlblxyXG4gKiBAcHJvcGVydHkge1BJWEkuUG9pbnRMaWtlfSB3b3JsZFxyXG4gKiBAcHJvcGVydHkge1ZpZXdwb3J0fSB2aWV3cG9ydFxyXG4gKi9cclxuXHJcbi8qKlxyXG4gKiBmaXJlcyB3aGVuIGEgcGluY2ggc3RhcnRzXHJcbiAqIEBldmVudCBWaWV3cG9ydCNwaW5jaC1zdGFydFxyXG4gKiBAdHlwZSB7Vmlld3BvcnR9XHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqIGZpcmVzIHdoZW4gYSBwaW5jaCBlbmRcclxuICogQGV2ZW50IFZpZXdwb3J0I3BpbmNoLWVuZFxyXG4gKiBAdHlwZSB7Vmlld3BvcnR9XHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqIGZpcmVzIHdoZW4gYSBzbmFwIHN0YXJ0c1xyXG4gKiBAZXZlbnQgVmlld3BvcnQjc25hcC1zdGFydFxyXG4gKiBAdHlwZSB7Vmlld3BvcnR9XHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqIGZpcmVzIHdoZW4gYSBzbmFwIGVuZHNcclxuICogQGV2ZW50IFZpZXdwb3J0I3NuYXAtZW5kXHJcbiAqIEB0eXBlIHtWaWV3cG9ydH1cclxuICovXHJcblxyXG4vKipcclxuICogZmlyZXMgd2hlbiBhIHNuYXAtem9vbSBzdGFydHNcclxuICogQGV2ZW50IFZpZXdwb3J0I3NuYXAtem9vbS1zdGFydFxyXG4gKiBAdHlwZSB7Vmlld3BvcnR9XHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqIGZpcmVzIHdoZW4gYSBzbmFwLXpvb20gZW5kc1xyXG4gKiBAZXZlbnQgVmlld3BvcnQjc25hcC16b29tLWVuZFxyXG4gKiBAdHlwZSB7Vmlld3BvcnR9XHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqIGZpcmVzIHdoZW4gYSBib3VuY2Ugc3RhcnRzIGluIHRoZSB4IGRpcmVjdGlvblxyXG4gKiBAZXZlbnQgVmlld3BvcnQjYm91bmNlLXgtc3RhcnRcclxuICogQHR5cGUge1ZpZXdwb3J0fVxyXG4gKi9cclxuXHJcbi8qKlxyXG4gKiBmaXJlcyB3aGVuIGEgYm91bmNlIGVuZHMgaW4gdGhlIHggZGlyZWN0aW9uXHJcbiAqIEBldmVudCBWaWV3cG9ydCNib3VuY2UteC1lbmRcclxuICogQHR5cGUge1ZpZXdwb3J0fVxyXG4gKi9cclxuXHJcbi8qKlxyXG4gKiBmaXJlcyB3aGVuIGEgYm91bmNlIHN0YXJ0cyBpbiB0aGUgeSBkaXJlY3Rpb25cclxuICogQGV2ZW50IFZpZXdwb3J0I2JvdW5jZS15LXN0YXJ0XHJcbiAqIEB0eXBlIHtWaWV3cG9ydH1cclxuICovXHJcblxyXG4vKipcclxuICogZmlyZXMgd2hlbiBhIGJvdW5jZSBlbmRzIGluIHRoZSB5IGRpcmVjdGlvblxyXG4gKiBAZXZlbnQgVmlld3BvcnQjYm91bmNlLXktZW5kXHJcbiAqIEB0eXBlIHtWaWV3cG9ydH1cclxuICovXHJcblxyXG4vKipcclxuICogZmlyZXMgd2hlbiBmb3IgYSBtb3VzZSB3aGVlbCBldmVudFxyXG4gKiBAZXZlbnQgVmlld3BvcnQjd2hlZWxcclxuICogQHR5cGUge29iamVjdH1cclxuICogQHByb3BlcnR5IHtvYmplY3R9IHdoZWVsXHJcbiAqIEBwcm9wZXJ0eSB7bnVtYmVyfSB3aGVlbC5keFxyXG4gKiBAcHJvcGVydHkge251bWJlcn0gd2hlZWwuZHlcclxuICogQHByb3BlcnR5IHtudW1iZXJ9IHdoZWVsLmR6XHJcbiAqIEBwcm9wZXJ0eSB7Vmlld3BvcnR9IHZpZXdwb3J0XHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqIGZpcmVzIHdoZW4gYSB3aGVlbC1zY3JvbGwgb2NjdXJzXHJcbiAqIEBldmVudCBWaWV3cG9ydCN3aGVlbC1zY3JvbGxcclxuICogQHR5cGUge1ZpZXdwb3J0fVxyXG4gKi9cclxuXHJcbi8qKlxyXG4gKiBmaXJlcyB3aGVuIGEgbW91c2UtZWRnZSBzdGFydHMgdG8gc2Nyb2xsXHJcbiAqIEBldmVudCBWaWV3cG9ydCNtb3VzZS1lZGdlLXN0YXJ0XHJcbiAqIEB0eXBlIHtWaWV3cG9ydH1cclxuICovXHJcblxyXG4vKipcclxuICogZmlyZXMgd2hlbiB0aGUgbW91c2UtZWRnZSBzY3JvbGxpbmcgZW5kc1xyXG4gKiBAZXZlbnQgVmlld3BvcnQjbW91c2UtZWRnZS1lbmRcclxuICogQHR5cGUge1ZpZXdwb3J0fVxyXG4gKi9cclxuXHJcbi8qKlxyXG4gKiBmaXJlcyB3aGVuIHZpZXdwb3J0IG1vdmVzIHRocm91Z2ggVUkgaW50ZXJhY3Rpb24sIGRlY2VsZXJhdGlvbiwgb3IgZm9sbG93XHJcbiAqIEBldmVudCBWaWV3cG9ydCNtb3ZlZFxyXG4gKiBAdHlwZSB7b2JqZWN0fVxyXG4gKiBAcHJvcGVydHkge1ZpZXdwb3J0fSB2aWV3cG9ydFxyXG4gKiBAcHJvcGVydHkge3N0cmluZ30gdHlwZSAoZHJhZywgc25hcCwgcGluY2gsIGZvbGxvdywgYm91bmNlLXgsIGJvdW5jZS15LCBjbGFtcC14LCBjbGFtcC15LCBkZWNlbGVyYXRlLCBtb3VzZS1lZGdlcywgd2hlZWwpXHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqIGZpcmVzIHdoZW4gdmlld3BvcnQgbW92ZXMgdGhyb3VnaCBVSSBpbnRlcmFjdGlvbiwgZGVjZWxlcmF0aW9uLCBvciBmb2xsb3dcclxuICogQGV2ZW50IFZpZXdwb3J0I3pvb21lZFxyXG4gKiBAdHlwZSB7b2JqZWN0fVxyXG4gKiBAcHJvcGVydHkge1ZpZXdwb3J0fSB2aWV3cG9ydFxyXG4gKiBAcHJvcGVydHkge3N0cmluZ30gdHlwZSAoZHJhZy16b29tLCBwaW5jaCwgd2hlZWwsIGNsYW1wLXpvb20pXHJcbiAqL1xyXG5cclxuUElYSS5leHRyYXMuVmlld3BvcnQgPSBWaWV3cG9ydFxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBWaWV3cG9ydFxyXG4iXX0=