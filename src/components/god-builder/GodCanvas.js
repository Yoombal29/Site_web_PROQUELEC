"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GodCanvas = exports.CanvasOverlays = void 0;
var react_1 = require("react");
var react_dom_1 = require("react-dom");
var core_1 = require("@craftjs/core");
var ProquelecBlocks_1 = require("../blocks/ProquelecBlocks");
var lucide_react_1 = require("lucide-react");
var sonner_1 = require("sonner");
var BuilderErrorBoundary_1 = require("./BuilderErrorBoundary");
var builder_ui_store_1 = require("@/stores/builder-ui.store");
var global_blocks_store_1 = require("@/stores/global-blocks.store");
var useAnimateOnScroll_1 = require("@/hooks/useAnimateOnScroll");
var cloneNodeTree_1 = require("./cloneNodeTree");
var VIEWPORT_WIDTHS = {
    desktop: '100%',
    tablet: '768px',
    mobile: '390px',
};
var ZOOM_CLASS_MAP = {
    50: 'builder-canvas-scale-50',
    75: 'builder-canvas-scale-75',
    100: 'builder-canvas-scale-100',
    125: 'builder-canvas-scale-125',
    150: 'builder-canvas-scale-150',
};
var CONTEXT_MENU_CLASS = 'builder-context-menu';
var HOVER_OUTLINE_CLASS = 'builder-hover-outline';
var SELECTED_OUTLINE_CLASS = 'builder-selected-outline';
var PADDING_TOP_CLASS = 'builder-padding-top';
var PADDING_BOTTOM_CLASS = 'builder-padding-bottom';
var PADDING_LEFT_CLASS = 'builder-padding-left';
var PADDING_RIGHT_CLASS = 'builder-padding-right';
// ─────────────────────────────────────────────────────────
// FLOATING ACTION BAR (appears above selected block)
// ─────────────────────────────────────────────────────────
var FloatingActionBar = function () {
    var _a = (0, core_1.useEditor)(function (state, query) {
        var _a, _b;
        var selectedSet = state.events.selected;
        var id = selectedSet ? Array.from(selectedSet)[0] : null;
        if (!id || !state.nodes[id])
            return { selected: null, isEnabled: state.options.enabled };
        var node = state.nodes[id];
        var parentId = node.data.parent;
        var siblings = parentId && ((_b = (_a = state.nodes[parentId]) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.nodes) || [];
        var myIndex = siblings.indexOf(id);
        return {
            selected: {
                id: id,
                name: node.data.displayName || node.data.name,
                isDeletable: query.node(id).isDeletable(),
                parentId: parentId,
                siblings: siblings,
                myIndex: myIndex,
            },
            isEnabled: state.options.enabled,
        };
    }), actions = _a.actions, selected = _a.selected, isEnabled = _a.isEnabled;
    if (!selected || !isEnabled)
        return null;
    var canMoveUp = selected.myIndex > 0;
    var canMoveDown = selected.myIndex < selected.siblings.length - 1;
    var handleDuplicate = function () {
        window.dispatchEvent(new CustomEvent('god-duplicate-node', { detail: selected.id }));
    };
    var handleMoveUp = function () {
        if (!canMoveUp || !selected.parentId)
            return;
        actions.move(selected.id, selected.parentId, selected.myIndex - 1);
        sonner_1.toast.success('Bloc déplacé vers le haut');
    };
    var handleMoveDown = function () {
        if (!canMoveDown || !selected.parentId)
            return;
        actions.move(selected.id, selected.parentId, selected.myIndex + 2);
        sonner_1.toast.success('Bloc déplacé vers le bas');
    };
    return (<div className="fixed inset-x-0 top-0 z-[9999] pointer-events-none">
      {/* Selection outline & actions is managed natively or via custom menu */}
    </div>);
};
// ─────────────────────────────────────────────────────────
// BREADCRUMB
// ─────────────────────────────────────────────────────────
var Breadcrumb = function () {
    var _a = (0, core_1.useEditor)(function (state, query) {
        var _a, _b, _c, _d, _e, _f;
        var selectedSet = state.events.selected;
        var id = selectedSet ? Array.from(selectedSet)[0] : null;
        if (!id || !state.nodes[id])
            return { ancestors: [], selectedName: null, isEnabled: state.options.enabled };
        var ancestors = [];
        var currentId = ((_b = (_a = state.nodes[id]) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.parent) || null;
        while (currentId && state.nodes[currentId]) {
            var node = state.nodes[currentId];
            ancestors.unshift({ id: currentId, name: node.data.displayName || node.data.name });
            currentId = node.data.parent || null;
        }
        return {
            ancestors: ancestors,
            selectedName: ((_d = (_c = state.nodes[id]) === null || _c === void 0 ? void 0 : _c.data) === null || _d === void 0 ? void 0 : _d.displayName) || ((_f = (_e = state.nodes[id]) === null || _e === void 0 ? void 0 : _e.data) === null || _f === void 0 ? void 0 : _f.name),
            isEnabled: state.options.enabled,
        };
    }), ancestors = _a.ancestors, selectedName = _a.selectedName, isEnabled = _a.isEnabled;
    if (!selectedName || !isEnabled)
        return null;
    return (<div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1 bg-[#12121f]/95 backdrop-blur border border-[#252538] rounded-full px-3 py-1.5 text-[11px] shadow-xl">
      <span className="text-slate-500">Page</span>
      {ancestors.map(function (a) { return (<react_1.default.Fragment key={a.id}>
          <span className="text-slate-600">›</span>
          <span className="text-slate-400">{a.name}</span>
        </react_1.default.Fragment>); })}
      <span className="text-slate-600">›</span>
      <span className="text-indigo-400 font-semibold">{selectedName}</span>
    </div>);
};
// ─────────────────────────────────────────────────────────
// EMPTY CANVAS PLACEHOLDER
// ─────────────────────────────────────────────────────────
var EmptyCanvasHint = function () {
    var _a = (0, core_1.useEditor)(function (state, query) {
        var _a, _b;
        var rootNodes = ((_b = (_a = state.nodes['ROOT']) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.nodes) || [];
        return {
            isEmpty: rootNodes.length === 0,
            isEnabled: state.options.enabled,
        };
    }), isEmpty = _a.isEmpty, isEnabled = _a.isEnabled;
    if (!isEmpty || !isEnabled)
        return null;
    return (<div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <div className="text-center space-y-3 p-8">
        <div className="text-5xl animate-bounce">🎨</div>
        <p className="text-slate-400 font-semibold">Page vide</p>
        <p className="text-slate-500 text-sm max-w-xs">
          Glissez des blocs depuis le panneau de gauche pour construire votre page
        </p>
      </div>
    </div>);
};
var CanvasOverlays = function () {
    var hoveredNodeId = (0, builder_ui_store_1.useBuilderUiStore)(function (s) { return s.hoveredNodeId; });
    var _a = (0, core_1.useEditor)(function (state) {
        var selectedSet = state.events.selected;
        var id = selectedSet ? Array.from(selectedSet)[0] : null;
        return {
            selectedNodeId: id,
            isEnabled: state.options.enabled
        };
    }), selectedNodeId = _a.selectedNodeId, query = _a.query, isEnabled = _a.isEnabled;
    var _b = (0, react_1.useState)(null), hoverRect = _b[0], setHoverRect = _b[1];
    var _c = (0, react_1.useState)(null), selectedRect = _c[0], setSelectedRect = _c[1];
    var _d = (0, react_1.useState)(''), hoverName = _d[0], setHoverName = _d[1];
    var _e = (0, react_1.useState)(''), selectedName = _e[0], setSelectedName = _e[1];
    var _f = (0, react_1.useState)(null), paddingStyles = _f[0], setPaddingStyles = _f[1];
    var _g = (0, react_1.useState)(null), marginStyles = _g[0], setMarginStyles = _g[1];
    var updateRects = (0, react_1.useCallback)(function () {
        if (!isEnabled) {
            setHoverRect(null);
            setSelectedRect(null);
            return;
        }
        var nextHoverRect = null;
        var nextSelectedRect = null;
        if (hoveredNodeId && hoveredNodeId !== 'ROOT') {
            var dom = query.node(hoveredNodeId).get().dom;
            if (dom) {
                nextHoverRect = dom.getBoundingClientRect();
                var node = query.node(hoveredNodeId).get();
                setHoverName(node.data.displayName || node.data.name);
            }
        }
        if (selectedNodeId && selectedNodeId !== 'ROOT') {
            var dom = query.node(selectedNodeId).get().dom;
            if (dom) {
                nextSelectedRect = dom.getBoundingClientRect();
                var node = query.node(selectedNodeId).get();
                setSelectedName(node.data.displayName || node.data.name);
                // Extract padding / margin computed values for visual guidelines
                var style = window.getComputedStyle(dom);
                setPaddingStyles({
                    top: style.paddingTop,
                    right: style.paddingRight,
                    bottom: style.paddingBottom,
                    left: style.paddingLeft
                });
                setMarginStyles({
                    top: style.marginTop,
                    right: style.marginRight,
                    bottom: style.marginBottom,
                    left: style.marginLeft
                });
            }
        }
        setHoverRect(nextHoverRect);
        setSelectedRect(nextSelectedRect);
    }, [hoveredNodeId, selectedNodeId, query, isEnabled]);
    // Batch updates using requestAnimationFrame
    (0, react_1.useEffect)(function () {
        var active = true;
        var tick = function () {
            if (!active)
                return;
            updateRects();
            requestAnimationFrame(tick);
        };
        // Trigger on scroll or resize
        window.addEventListener('scroll', updateRects, true);
        window.addEventListener('resize', updateRects);
        requestAnimationFrame(tick);
        return function () {
            active = false;
            window.removeEventListener('scroll', updateRects, true);
            window.removeEventListener('resize', updateRects);
        };
    }, [updateRects]);
    var overlayStyles = (0, react_1.useMemo)(function () {
        var css = '';
        if (hoverRect) {
            css += ".".concat(HOVER_OUTLINE_CLASS, "{top:").concat(hoverRect.top, "px;left:").concat(hoverRect.left, "px;width:").concat(hoverRect.width, "px;height:").concat(hoverRect.height, "px;}");
        }
        if (selectedRect) {
            css += ".".concat(SELECTED_OUTLINE_CLASS, "{top:").concat(selectedRect.top, "px;left:").concat(selectedRect.left, "px;width:").concat(selectedRect.width, "px;height:").concat(selectedRect.height, "px;}");
        }
        if (paddingStyles) {
            css += ".".concat(PADDING_TOP_CLASS, "{height:").concat(paddingStyles.top, ";}");
            css += ".".concat(PADDING_BOTTOM_CLASS, "{height:").concat(paddingStyles.bottom, ";}");
            css += ".".concat(PADDING_LEFT_CLASS, "{width:").concat(paddingStyles.left, ";}");
            css += ".".concat(PADDING_RIGHT_CLASS, "{width:").concat(paddingStyles.right, ";}");
        }
        return css;
    }, [hoverRect, selectedRect, paddingStyles]);
    if (!isEnabled)
        return null;
    return (0, react_dom_1.createPortal)(<>
      <style>{overlayStyles}</style>
      <div className="pointer-events-none fixed inset-0 z-[999999]">
        {/* Hover Outline */}
        {hoverRect && hoveredNodeId !== selectedNodeId && (<div className={"absolute border border-sky-400 bg-sky-400/5 transition-all duration-75 ".concat(HOVER_OUTLINE_CLASS)}>
            <div className="absolute -top-5 left-0 bg-sky-400 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow flex items-center gap-1">
              <span>{hoverName}</span>
              <span className="opacity-75">{Math.round(hoverRect.width)} x {Math.round(hoverRect.height)}</span>
            </div>
          </div>)}

        {/* Selected Outline & Spacing Guides */}
        {selectedRect && (<div className={"absolute border-2 border-indigo-500 transition-all duration-75 ".concat(SELECTED_OUTLINE_CLASS)}>
            <div className="absolute -top-5.5 left-0 bg-indigo-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow flex items-center gap-1.5">
              <span>{selectedName}</span>
              <span className="opacity-75">{Math.round(selectedRect.width)} x {Math.round(selectedRect.height)}</span>
            </div>

            {/* Padding Visualizer (Inside) */}
            {paddingStyles && (<div className="absolute inset-0 border border-emerald-400/30 bg-emerald-400/5 pointer-events-none">
                {/* Padding Indicators */}
                <div className={"absolute top-0 left-0 right-0 bg-emerald-400/10 ".concat(PADDING_TOP_CLASS)}/>
                <div className={"absolute bottom-0 left-0 right-0 bg-emerald-400/10 ".concat(PADDING_BOTTOM_CLASS)}/>
                <div className={"absolute top-0 bottom-0 left-0 bg-emerald-400/10 ".concat(PADDING_LEFT_CLASS)}/>
                <div className={"absolute top-0 bottom-0 right-0 bg-emerald-400/10 ".concat(PADDING_RIGHT_CLASS)}/>
              </div>)}
          </div>)}
      </div>
    </>, document.body);
};
exports.CanvasOverlays = CanvasOverlays;
// ─────────────────────────────────────────────────────────
// MAIN CANVAS
// ─────────────────────────────────────────────────────────
var GodCanvas = function () {
    var _a;
    var _b = (0, react_1.useState)('desktop'), device = _b[0], setDevice = _b[1];
    var _c = (0, react_1.useState)(100), zoom = _c[0], setZoom = _c[1];
    var _d = (0, react_1.useState)(null), contextMenu = _d[0], setContextMenu = _d[1];
    var _e = (0, core_1.useEditor)(function (state) { return ({
        isEnabled: state.options.enabled
    }); }), isEnabled = _e.isEnabled, actions = _e.actions, query = _e.query;
    var _f = (0, builder_ui_store_1.useBuilderUiStore)(), setHoveredNodeId = _f.setHoveredNodeId, hoveredNodeId = _f.hoveredNodeId;
    var canvasRef = (0, react_1.useRef)(null);
    (0, useAnimateOnScroll_1.useAnimateOnScroll)(canvasRef, { threshold: 0.1, once: true });
    var handleMouseMove = function (e) {
        if (!isEnabled)
            return;
        var target = e.target;
        var allNodeIds = Object.keys(query.getSerializedNodes());
        var hoveredId = null;
        var deepestDepth = -1;
        for (var _i = 0, allNodeIds_1 = allNodeIds; _i < allNodeIds_1.length; _i++) {
            var id = allNodeIds_1[_i];
            var dom = query.node(id).get().dom;
            if (dom && dom.contains(target)) {
                var depth = query.node(id).ancestors().length;
                if (depth > deepestDepth && id !== 'ROOT') {
                    deepestDepth = depth;
                    hoveredId = id;
                }
            }
        }
        if (hoveredId !== hoveredNodeId) {
            setHoveredNodeId(hoveredId);
        }
    };
    (0, react_1.useEffect)(function () {
        var handler = function (e) { return setDevice(e.detail); };
        window.addEventListener('god-viewport-change', handler);
        return function () { return window.removeEventListener('god-viewport-change', handler); };
    }, []);
    // Close context menu on left click anywhere
    (0, react_1.useEffect)(function () {
        var handleClose = function () { return setContextMenu(null); };
        window.addEventListener('click', handleClose);
        return function () { return window.removeEventListener('click', handleClose); };
    }, []);
    // Duplicate custom event listener
    (0, react_1.useEffect)(function () {
        var handleDuplicateCustom = function (e) {
            var nodeId = e.detail;
            if (nodeId)
                handleDuplicate(nodeId);
        };
        window.addEventListener('god-duplicate-node', handleDuplicateCustom);
        return function () { return window.removeEventListener('god-duplicate-node', handleDuplicateCustom); };
    }, [query]);
    // Synchronize lockedNodes & hiddenNodes from Zustand to canvas DOM attributes
    var _g = (0, builder_ui_store_1.useBuilderUiStore)(), lockedNodes = _g.lockedNodes, hiddenNodes = _g.hiddenNodes;
    (0, react_1.useEffect)(function () {
        if (!isEnabled)
            return;
        var allNodeIds = Object.keys(query.getSerializedNodes());
        allNodeIds.forEach(function (id) {
            try {
                var dom = query.node(id).get().dom;
                if (dom) {
                    dom.setAttribute('data-locked', lockedNodes[id] ? 'true' : 'false');
                    dom.setAttribute('data-hidden', hiddenNodes[id] ? 'true' : 'false');
                }
            }
            catch (e) { }
        });
    }, [lockedNodes, hiddenNodes, query, isEnabled]);
    var deviceLabel = {
        desktop: '🖥️ Desktop',
        tablet: '📱 Tablet — 768px',
        mobile: '📱 Mobile — 390px',
    }[device];
    // ─────────────────────────────────────────────────────────
    // CONTEXT MENU HANDLERS
    // ─────────────────────────────────────────────────────────
    var handleContextMenu = function (e) {
        if (!isEnabled)
            return;
        e.preventDefault();
        var target = e.target;
        var allNodeIds = Object.keys(query.getSerializedNodes());
        var clickedNodeId = null;
        var deepestDepth = -1;
        // Find deepest node DOM element containing the target
        for (var _i = 0, allNodeIds_2 = allNodeIds; _i < allNodeIds_2.length; _i++) {
            var id = allNodeIds_2[_i];
            var node = query.node(id).get();
            if (node.dom && node.dom.contains(target)) {
                var depth = query.node(id).ancestors().length;
                if (depth > deepestDepth && id !== 'ROOT') {
                    deepestDepth = depth;
                    clickedNodeId = id;
                }
            }
        }
        if (!clickedNodeId) {
            clickedNodeId = 'ROOT';
        }
        // Select the clicked node
        actions.selectNode(clickedNodeId);
        var nodeName = query.node(clickedNodeId).get().data.displayName || query.node(clickedNodeId).get().data.name;
        setContextMenu({
            x: e.clientX,
            y: e.clientY,
            nodeId: clickedNodeId,
            nodeName: nodeName,
        });
    };
    var isNodeLocked = (0, react_1.useCallback)(function (id) {
        var _a;
        var currentId = id;
        while (currentId) {
            if (builder_ui_store_1.useBuilderUiStore.getState().lockedNodes[currentId])
                return true;
            try {
                var node = query.node(currentId).get();
                currentId = ((_a = node === null || node === void 0 ? void 0 : node.data) === null || _a === void 0 ? void 0 : _a.parent) || null;
            }
            catch (e) {
                break;
            }
        }
        return false;
    }, [query]);
    var handleCopy = function (id) { return __awaiter(void 0, void 0, void 0, function () {
        var tree, json, _1, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 5, , 6]);
                    tree = query.node(id).toNodeTree();
                    json = JSON.stringify(tree);
                    localStorage.setItem('proquelec_builder_clipboard', json);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, navigator.clipboard.writeText(json)];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    _1 = _a.sent();
                    return [3 /*break*/, 4];
                case 4:
                    sonner_1.toast.success("Bloc \"".concat(query.node(id).get().data.displayName || query.node(id).get().data.name, "\" copi\u00E9"));
                    return [3 /*break*/, 6];
                case 5:
                    err_1 = _a.sent();
                    sonner_1.toast.error('Erreur lors de la copie du bloc');
                    return [3 /*break*/, 6];
                case 6: return [2 /*return*/];
            }
        });
    }); };
    var handlePaste = function (parentId) { return __awaiter(void 0, void 0, void 0, function () {
        var clipboard, _2, tree, newTree, targetNode, resolvedParentId, resolvedIndex, siblings;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (isNodeLocked(parentId)) {
                        sonner_1.toast.error('Conteneur verrouillé : action impossible');
                        return [2 /*return*/];
                    }
                    clipboard = localStorage.getItem('proquelec_builder_clipboard');
                    if (!!clipboard) return [3 /*break*/, 4];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, navigator.clipboard.readText()];
                case 2:
                    clipboard = _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    _2 = _a.sent();
                    return [3 /*break*/, 4];
                case 4:
                    if (!clipboard) {
                        sonner_1.toast.error('Le presse-papier est vide');
                        return [2 /*return*/];
                    }
                    try {
                        tree = JSON.parse(clipboard);
                        newTree = (0, cloneNodeTree_1.cloneNodeTreeWithNewIds)(tree, 'paste');
                        targetNode = query.node(parentId).get();
                        resolvedParentId = parentId;
                        resolvedIndex = undefined;
                        // If pasting on a leaf block, paste as sibling
                        if (parentId !== 'ROOT' && targetNode.data.name !== 'ContainerBlock' && targetNode.data.name !== 'ColumnsBlock') {
                            resolvedParentId = targetNode.data.parent || 'ROOT';
                            if (isNodeLocked(resolvedParentId)) {
                                sonner_1.toast.error('Conteneur parent verrouillé : action impossible');
                                return [2 /*return*/];
                            }
                            siblings = query.node(resolvedParentId).childNodes();
                            resolvedIndex = siblings.indexOf(parentId) + 1;
                        }
                        actions.addNodeTree(newTree, resolvedParentId, resolvedIndex);
                        sonner_1.toast.success('Bloc collé avec succès');
                    }
                    catch (err) {
                        console.error(err);
                        sonner_1.toast.error('Impossible de coller le bloc');
                    }
                    return [2 /*return*/];
            }
        });
    }); };
    var handlePasteStyle = function (targetId) {
        if (isNodeLocked(targetId)) {
            sonner_1.toast.error('Bloc verrouillé : action impossible');
            return;
        }
        var clipboard = localStorage.getItem('proquelec_builder_clipboard');
        if (!clipboard) {
            sonner_1.toast.error('Presse-papier vide');
            return;
        }
        try {
            var tree = JSON.parse(clipboard);
            var sourceProps_1 = tree.rootNode.data.props;
            var styleKeys_1 = [
                'marginTop', 'marginRight', 'marginBottom', 'marginLeft',
                'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft',
                'borderWidth', 'borderColor', 'borderStyle', 'borderRadius',
                'opacity', 'boxShadow', 'zIndex', 'customInlineCss', 'extraClasses'
            ];
            actions.setProp(targetId, function (props) {
                styleKeys_1.forEach(function (key) {
                    if (sourceProps_1[key] !== undefined) {
                        props[key] = JSON.parse(JSON.stringify(sourceProps_1[key]));
                    }
                });
            });
            sonner_1.toast.success('Style collé uniquement');
        }
        catch (err) {
            sonner_1.toast.error('Impossible de coller les styles');
        }
    };
    var handleDuplicate = function (id) {
        if (id === 'ROOT')
            return;
        if (isNodeLocked(id)) {
            sonner_1.toast.error('Bloc verrouillé : action impossible');
            return;
        }
        try {
            var node = query.node(id).get();
            var parentId = node.data.parent || 'ROOT';
            if (isNodeLocked(parentId)) {
                sonner_1.toast.error('Conteneur parent verrouillé : action impossible');
                return;
            }
            var siblings = query.node(parentId).childNodes();
            var index = siblings.indexOf(id) + 1;
            var tree = query.node(id).toNodeTree();
            var newTree = (0, cloneNodeTree_1.cloneNodeTreeWithNewIds)(tree, 'dup');
            actions.addNodeTree(newTree, parentId, index);
            actions.selectNode(newTree.rootNodeId);
            sonner_1.toast.success('Bloc dupliqué avec succès');
        }
        catch (err) {
            console.error('Duplicate error:', err);
            sonner_1.toast.error('Erreur lors de la duplication');
        }
    };
    var handleResetStyle = function (id) {
        if (isNodeLocked(id)) {
            sonner_1.toast.error('Bloc verrouillé : action impossible');
            return;
        }
        try {
            var styleKeys_2 = [
                'marginTop', 'marginRight', 'marginBottom', 'marginLeft',
                'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft',
                'borderWidth', 'borderColor', 'borderStyle', 'borderRadius',
                'opacity', 'boxShadow', 'zIndex', 'customInlineCss', 'extraClasses'
            ];
            actions.setProp(id, function (props) {
                styleKeys_2.forEach(function (key) {
                    delete props[key];
                });
            });
            sonner_1.toast.success('Style réinitialisé');
        }
        catch (err) {
            sonner_1.toast.error('Erreur lors de la réinitialisation');
        }
    };
    var handleResetBlock = function (id) {
        var _a;
        if (isNodeLocked(id)) {
            sonner_1.toast.error('Bloc verrouillé : action impossible');
            return;
        }
        try {
            var node = query.node(id).get();
            var ComponentType = node.data.type;
            var defaultProps_1 = ((_a = ComponentType === null || ComponentType === void 0 ? void 0 : ComponentType.craft) === null || _a === void 0 ? void 0 : _a.props) || {};
            actions.setProp(id, function (props) {
                // Remet chaque prop à sa valeur par défaut
                Object.entries(defaultProps_1).forEach(function (_a) {
                    var key = _a[0], value = _a[1];
                    props[key] = JSON.parse(JSON.stringify(value));
                });
                // Supprime les props qui ne sont pas dans les valeurs par défaut
                Object.keys(props).forEach(function (key) {
                    if (!(key in defaultProps_1)) {
                        delete props[key];
                    }
                });
            });
            var displayName = node.data.displayName || node.data.name || 'Bloc';
            sonner_1.toast.success("\"".concat(displayName, "\" r\u00E9initialis\u00E9 aux valeurs par d\u00E9faut"));
        }
        catch (err) {
            console.error('ResetBlock error:', err);
            sonner_1.toast.error('Erreur lors de la réinitialisation du bloc');
        }
    };
    var handleMoveUp = function (id) {
        if (isNodeLocked(id)) {
            sonner_1.toast.error('Bloc verrouillé : action impossible');
            return;
        }
        var parentId = query.node(id).get().data.parent;
        if (!parentId)
            return;
        if (isNodeLocked(parentId)) {
            sonner_1.toast.error('Conteneur parent verrouillé : action impossible');
            return;
        }
        var siblings = query.node(parentId).childNodes();
        var idx = siblings.indexOf(id);
        if (idx > 0) {
            actions.move(id, parentId, idx - 1);
            sonner_1.toast.success('Bloc déplacé vers le haut');
        }
    };
    var handleMoveDown = function (id) {
        if (isNodeLocked(id)) {
            sonner_1.toast.error('Bloc verrouillé : action impossible');
            return;
        }
        var parentId = query.node(id).get().data.parent;
        if (!parentId)
            return;
        if (isNodeLocked(parentId)) {
            sonner_1.toast.error('Conteneur parent verrouillé : action impossible');
            return;
        }
        var siblings = query.node(parentId).childNodes();
        var idx = siblings.indexOf(id);
        if (idx < siblings.length - 1) {
            actions.move(id, parentId, idx + 2);
            sonner_1.toast.success('Bloc déplacé vers le bas');
        }
    };
    var handleSaveAsTemplate = function (id) { return __awaiter(void 0, void 0, void 0, function () {
        var name_1, tree, token, response, err_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    name_1 = window.prompt("Nom du modèle :");
                    if (!name_1)
                        return [2 /*return*/];
                    tree = query.node(id).toNodeTree();
                    token = localStorage.getItem('token');
                    return [4 /*yield*/, fetch('/api/admin/page-components', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': token ? "Bearer ".concat(token) : ''
                            },
                            body: JSON.stringify({
                                name: name_1,
                                category: 'Mes Modèles',
                                default_structure: JSON.stringify(tree),
                                thumbnail_url: null,
                                is_global: false
                            })
                        })];
                case 1:
                    response = _a.sent();
                    if (!response.ok) {
                        throw new Error('Erreur réseau lors de la sauvegarde');
                    }
                    return [4 /*yield*/, response.json()];
                case 2:
                    _a.sent();
                    sonner_1.toast.success("Mod\u00E8le \"".concat(name_1, "\" enregistr\u00E9 avec succ\u00E8s !"));
                    window.dispatchEvent(new CustomEvent('god-templates-updated'));
                    return [3 /*break*/, 4];
                case 3:
                    err_2 = _a.sent();
                    console.error(err_2);
                    sonner_1.toast.error("Erreur lors de la sauvegarde du modèle");
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var handleSaveAsGlobal = function (id) {
        try {
            var name_2 = window.prompt("Nom du bloc global :");
            if (!name_2)
                return;
            var tree = query.node(id).toNodeTree();
            var addBlock = global_blocks_store_1.useGlobalBlocksStore.getState().addBlock;
            addBlock({ name: name_2, serializedNode: tree, category: 'Général' });
            sonner_1.toast.success("Bloc global \"".concat(name_2, "\" enregistr\u00E9 !"));
            window.dispatchEvent(new CustomEvent('god-global-blocks-updated'));
        }
        catch (err) {
            console.error(err);
            sonner_1.toast.error("Erreur lors de la sauvegarde du bloc global");
        }
    };
    return (<div className="flex-1 bg-[#0a0a15] overflow-auto custom-scrollbar flex flex-col relative">
      {/* Top bar: device info + zoom */}
      <div className="sticky top-0 left-0 right-0 z-20 flex items-center justify-between px-4 py-2 bg-[#0a0a15]/95 backdrop-blur border-b border-[#1a1a2a]">
        <span className="text-[11px] text-slate-500 font-mono">{deviceLabel}</span>

        <div className="flex items-center gap-2">
          {!isEnabled && (<span className="flex items-center gap-1 text-[11px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              <lucide_react_1.Eye size={10}/> MODE APERÇU
            </span>)}

          {/* Zoom controls */}
          <div className="flex items-center gap-1 bg-[#151521] border border-[#252538] rounded-lg px-2 py-1">
            <button onClick={function () { return setZoom(function (z) { return Math.max(50, z - 25); }); }} className="text-slate-400 hover:text-white text-xs w-4 text-center transition-colors" title="Zoom out">−</button>
            <span className="text-[11px] text-slate-400 font-mono w-10 text-center">{zoom}%</span>
            <button onClick={function () { return setZoom(function (z) { return Math.min(150, z + 25); }); }} className="text-slate-400 hover:text-white text-xs w-4 text-center transition-colors" title="Zoom in">+</button>
            <button onClick={function () { return setZoom(100); }} className="text-slate-500 hover:text-white text-[10px] ml-1 transition-colors" title="Reset zoom">↺</button>
          </div>
        </div>
      </div>

      {/* Canvas area */}
      <div className="flex-1 p-6 flex justify-center min-h-full relative" onContextMenu={handleContextMenu} onMouseMove={handleMouseMove} onMouseLeave={function () { return setHoveredNodeId(null); }}>
        <div data-viewport={device} className="canvas-viewport-wrapper">
          <div ref={canvasRef} data-builder-canvas className={"relative bg-white shadow-2xl shadow-black/40 transition-all duration-300 ease-out build-canvas-wrapper ".concat((_a = ZOOM_CLASS_MAP[zoom]) !== null && _a !== void 0 ? _a : '', " ").concat(isEnabled ? 'builder-canvas-enabled' : 'builder-canvas-disabled')}>
            <BuilderErrorBoundary_1.BuilderErrorBoundary>
              <core_1.Frame>
                <core_1.Element is={ProquelecBlocks_1.ContainerBlock} canvas padding={0} backgroundColor="#ffffff" maxWidth="100%">
                  <core_1.Element is={ProquelecBlocks_1.HeroBlock} canvas/>
                  <core_1.Element is={ProquelecBlocks_1.ContainerBlock} canvas padding={60} paddingY={60} backgroundColor="#f8fafc">
                    <ProquelecBlocks_1.TextBlock text="🚀 GOD MODE — ÉDITEUR CENTRALISÉ" fontSize={28} textAlign="center" color="#0f172a" fontWeight="900"/>
                    <ProquelecBlocks_1.SpacerBlock height={16}/>
                    <ProquelecBlocks_1.TextBlock text="Glissez des blocs depuis la barre de gauche. Cliquez pour éditer leurs propriétés dans le panneau de droite." fontSize={16} textAlign="center" color="#64748b"/>
                  </core_1.Element>
                  <core_1.Element is={ProquelecBlocks_1.StatsBlock} canvas/>
                </core_1.Element>
              </core_1.Frame>
            </BuilderErrorBoundary_1.BuilderErrorBoundary>

            <EmptyCanvasHint />
          </div>
        </div>
      </div>

      {/* Breadcrumb overlay */}
      <div className="absolute bottom-0 left-0 right-0 pointer-events-none flex justify-center pb-4">
        <Breadcrumb />
      </div>

      {/* Floating Action Bar */}
      <FloatingActionBar />

      {/* Sleek Context Menu */}
      {contextMenu && (<>
          <style>{".".concat(CONTEXT_MENU_CLASS, "{top:").concat(contextMenu.y, "px;left:").concat(contextMenu.x, "px;}")}</style>
          <div className={"fixed z-[99999] bg-[#0c0c14]/90 backdrop-blur-md border border-[#252538] rounded-xl p-1.5 shadow-2xl w-52 text-left animate-in fade-in zoom-in-95 duration-100 ".concat(CONTEXT_MENU_CLASS)} onClick={function (e) { return e.stopPropagation(); }}>
          {/* Header */}
          <div className="px-2.5 py-1.5 text-[9px] font-bold text-slate-500 uppercase tracking-wider border-b border-[#252538] mb-1 flex items-center justify-between gap-1.5">
            <span className="flex items-center gap-1.5 truncate">
              <lucide_react_1.Layers size={10} className="text-indigo-400 shrink-0"/>
              {contextMenu.nodeName}
            </span>
            {isNodeLocked(contextMenu.nodeId) && (<span className="text-red-400 text-[8px] font-bold bg-red-500/10 px-1 py-0.5 rounded border border-red-500/25 uppercase shrink-0">
                🔒 Verrouillé
              </span>)}
          </div>

          {/* Action List */}
          <div className="space-y-0.5">
            <button onClick={function () { handleCopy(contextMenu.nodeId); setContextMenu(null); }} className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-[#1f1f35] text-xs transition-colors">
              <lucide_react_1.Copy size={13} className="text-indigo-400 shrink-0"/>
              Copier
            </button>
            <button onClick={function () { handlePaste(contextMenu.nodeId); setContextMenu(null); }} className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-[#1f1f35] text-xs transition-colors">
              <lucide_react_1.Clipboard size={13} className="text-emerald-400 shrink-0"/>
              Coller
            </button>
            <button onClick={function () { handlePasteStyle(contextMenu.nodeId); setContextMenu(null); }} className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-[#1f1f35] text-xs transition-colors">
              <lucide_react_1.Paintbrush size={13} className="text-amber-400 shrink-0"/>
              Coller le style uniquement
            </button>

            {contextMenu.nodeId !== 'ROOT' && (<>
                <div className="h-px bg-[#252538] my-1"/>
                <button onClick={function () { handleSaveAsTemplate(contextMenu.nodeId); setContextMenu(null); }} className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-[#1f1f35] text-xs transition-colors">
                  <lucide_react_1.Layers size={13} className="text-amber-400 shrink-0"/>
                  Enregistrer comme modèle
                </button>
                <button onClick={function () { handleSaveAsGlobal(contextMenu.nodeId); setContextMenu(null); }} className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-[#1f1f35] text-xs transition-colors">
                  <lucide_react_1.Save size={13} className="text-emerald-400 shrink-0"/>
                  Enregistrer comme Global
                </button>
                <button onClick={function () { handleDuplicate(contextMenu.nodeId); setContextMenu(null); }} className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-[#1f1f35] text-xs transition-colors">
                  <lucide_react_1.Copy size={13} className="text-sky-400 shrink-0"/>
                  Dupliquer
                </button>
                <button onClick={function () { handleMoveUp(contextMenu.nodeId); setContextMenu(null); }} className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-[#1f1f35] text-xs transition-colors">
                  <lucide_react_1.ChevronUp size={13} className="text-slate-400 shrink-0"/>
                  Déplacer vers le haut
                </button>
                <button onClick={function () { handleMoveDown(contextMenu.nodeId); setContextMenu(null); }} className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-[#1f1f35] text-xs transition-colors">
                  <lucide_react_1.ChevronDown size={13} className="text-slate-400 shrink-0"/>
                  Déplacer vers le bas
                </button>

                <div className="h-px bg-[#252538] my-1"/>
                <button onClick={function () { handleResetStyle(contextMenu.nodeId); setContextMenu(null); }} className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-[#1f1f35] text-xs transition-colors">
                  <lucide_react_1.RefreshCw size={13} className="text-yellow-500 shrink-0"/>
                  Réinitialiser le style
                </button>
                <button onClick={function () { handleResetBlock(contextMenu.nodeId); setContextMenu(null); }} className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-[#1f1f35] text-xs transition-colors">
                  <lucide_react_1.RefreshCw size={13} className="text-red-400 shrink-0"/>
                  Réinitialiser le bloc
                </button>
                <button onClick={function () {
                    if (isNodeLocked(contextMenu.nodeId)) {
                        sonner_1.toast.error('Bloc verrouillé : action impossible');
                        return;
                    }
                    actions.delete(contextMenu.nodeId);
                    setContextMenu(null);
                    sonner_1.toast.success('Bloc supprimé');
                }} className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-rose-400 hover:text-white hover:bg-rose-500/20 text-xs transition-colors font-semibold">
                  <lucide_react_1.Trash2 size={13} className="text-rose-500 shrink-0"/>
                  Supprimer
                </button>
              </>)}
          </div>
        </div>
      </>)}
      {/* Visual Canvas Overlays (Hover Outlines & Spacing Guides) */}
      <exports.CanvasOverlays />

      <style>{"\n        /* Responsive viewport simulation */\n        .canvas-viewport-wrapper {\n          transition: width 0.3s ease-out;\n        }\n        .canvas-viewport-wrapper[data-viewport=\"mobile\"] {\n          width: 390px;\n          --responsive-breakpoint: 390px;\n        }\n        .canvas-viewport-wrapper[data-viewport=\"tablet\"] {\n          width: 768px;\n          --responsive-breakpoint: 768px;\n        }\n        .canvas-viewport-wrapper[data-viewport=\"desktop\"] {\n          width: 100%;\n          --responsive-breakpoint: 100%;\n        }\n\n        .build-canvas-wrapper {\n          width: 100%;\n          min-height: 900px;\n          transform-origin: top center;\n        }\n        .builder-canvas-enabled {\n          outline: 1px solid rgba(99,102,241,0.15);\n        }\n        .builder-canvas-disabled {\n          outline: none;\n        }\n        .builder-canvas-scale-50 { transform: scale(0.5); margin-bottom: -450px; }\n        .builder-canvas-scale-75 { transform: scale(0.75); margin-bottom: -225px; }\n        .builder-canvas-scale-100 { transform: scale(1); margin-bottom: 0; }\n        .builder-canvas-scale-125 { transform: scale(1.25); margin-bottom: 0; }\n        .builder-canvas-scale-150 { transform: scale(1.5); margin-bottom: 0; }\n\n        /* Simulate media queries based on data-viewport attribute */\n        .canvas-viewport-wrapper[data-viewport=\"mobile\"] [data-builder-canvas] .container-block {\n          --viewport-width: 390px;\n        }\n        .canvas-viewport-wrapper[data-viewport=\"tablet\"] [data-builder-canvas] .container-block {\n          --viewport-width: 768px;\n        }\n\n        /* Hide mobile/tablet-only indicators when not in that viewport */\n        .canvas-viewport-wrapper[data-viewport=\"desktop\"] .responsive-only-mobile,\n        .canvas-viewport-wrapper[data-viewport=\"desktop\"] .responsive-only-tablet { display: none; }\n        .canvas-viewport-wrapper[data-viewport=\"tablet\"] .responsive-only-desktop,\n        .canvas-viewport-wrapper[data-viewport=\"tablet\"] .responsive-only-mobile { display: none; }\n        .canvas-viewport-wrapper[data-viewport=\"mobile\"] .responsive-only-desktop,\n        .canvas-viewport-wrapper[data-viewport=\"mobile\"] .responsive-only-tablet { display: none; }\n\n        /* Style for hidden nodes inside builder canvas */\n        .proquelec-builder-node[data-hidden=\"true\"] {\n          opacity: 0.35 !important;\n          outline: 1px dashed #f59e0b !important;\n          background-image: repeating-linear-gradient(45deg, rgba(245, 158, 11, 0.05), rgba(245, 158, 11, 0.05) 10px, transparent 10px, transparent 20px) !important;\n        }\n\n        /* Style for locked nodes inside builder canvas */\n        .proquelec-builder-node[data-locked=\"true\"] {\n          pointer-events: none !important;\n          user-select: none !important;\n        }\n\n        /* Entrance Animations \u2014 paused by default, triggered on scroll via IntersectionObserver */\n        .animate-fadeIn, .animate-fadeInUp, .animate-fadeInDown, .animate-fadeInLeft, .animate-fadeInRight,\n        .animate-slideInUp, .animate-slideInDown, .animate-slideInLeft, .animate-slideInRight,\n        .animate-zoomIn, .animate-zoomInUp, .animate-zoomInDown,\n        .animate-bounceIn, .animate-flipInX, .animate-flipInY {\n          animation-play-state: paused !important;\n        }\n        .animate-fadeIn.is-visible, .animate-fadeInUp.is-visible, .animate-fadeInDown.is-visible, .animate-fadeInLeft.is-visible, .animate-fadeInRight.is-visible,\n        .animate-slideInUp.is-visible, .animate-slideInDown.is-visible, .animate-slideInLeft.is-visible, .animate-slideInRight.is-visible,\n        .animate-zoomIn.is-visible, .animate-zoomInUp.is-visible, .animate-zoomInDown.is-visible,\n        .animate-bounceIn.is-visible, .animate-flipInX.is-visible, .animate-flipInY.is-visible {\n          animation-play-state: running !important;\n        }\n        .animate-fadeIn { animation: anim-fadeIn var(--anim-duration, 600ms) var(--anim-easing, ease-out) var(--anim-delay, 0ms) both; }\n        .animate-fadeInUp { animation: anim-fadeInUp var(--anim-duration, 600ms) var(--anim-easing, ease-out) var(--anim-delay, 0ms) both; }\n        .animate-fadeInDown { animation: anim-fadeInDown var(--anim-duration, 600ms) var(--anim-easing, ease-out) var(--anim-delay, 0ms) both; }\n        .animate-fadeInLeft { animation: anim-fadeInLeft var(--anim-duration, 600ms) var(--anim-easing, ease-out) var(--anim-delay, 0ms) both; }\n        .animate-fadeInRight { animation: anim-fadeInRight var(--anim-duration, 600ms) var(--anim-easing, ease-out) var(--anim-delay, 0ms) both; }\n        .animate-slideInUp { animation: anim-slideInUp var(--anim-duration, 600ms) var(--anim-easing, ease-out) var(--anim-delay, 0ms) both; }\n        .animate-slideInDown { animation: anim-slideInDown var(--anim-duration, 600ms) var(--anim-easing, ease-out) var(--anim-delay, 0ms) both; }\n        .animate-slideInLeft { animation: anim-slideInLeft var(--anim-duration, 600ms) var(--anim-easing, ease-out) var(--anim-delay, 0ms) both; }\n        .animate-slideInRight { animation: anim-slideInRight var(--anim-duration, 600ms) var(--anim-easing, ease-out) var(--anim-delay, 0ms) both; }\n        .animate-zoomIn { animation: anim-zoomIn var(--anim-duration, 600ms) var(--anim-easing, ease-out) var(--anim-delay, 0ms) both; }\n        .animate-zoomInUp { animation: anim-zoomInUp var(--anim-duration, 600ms) var(--anim-easing, ease-out) var(--anim-delay, 0ms) both; }\n        .animate-zoomInDown { animation: anim-zoomInDown var(--anim-duration, 600ms) var(--anim-easing, ease-out) var(--anim-delay, 0ms) both; }\n        .animate-bounceIn { animation: anim-bounceIn var(--anim-duration, 800ms) var(--anim-easing, ease-out) var(--anim-delay, 0ms) both; }\n        .animate-flipInX { animation: anim-flipInX var(--anim-duration, 600ms) var(--anim-easing, ease-out) var(--anim-delay, 0ms) both; }\n        .animate-flipInY { animation: anim-flipInY var(--anim-duration, 600ms) var(--anim-easing, ease-out) var(--anim-delay, 0ms) both; }\n\n        @keyframes anim-fadeIn { from { opacity: 0; } to { opacity: 1; } }\n        @keyframes anim-fadeInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }\n        @keyframes anim-fadeInDown { from { opacity: 0; transform: translateY(-30px); } to { opacity: 1; transform: translateY(0); } }\n        @keyframes anim-fadeInLeft { from { opacity: 0; transform: translateX(-30px); } to { opacity: 1; transform: translateX(0); } }\n        @keyframes anim-fadeInRight { from { opacity: 0; transform: translateX(30px); } to { opacity: 1; transform: translateX(0); } }\n        @keyframes anim-slideInUp { from { transform: translateY(100%); } to { transform: translateY(0); } }\n        @keyframes anim-slideInDown { from { transform: translateY(-100%); } to { transform: translateY(0); } }\n        @keyframes anim-slideInLeft { from { transform: translateX(-100%); } to { transform: translateX(0); } }\n        @keyframes anim-slideInRight { from { transform: translateX(100%); } to { transform: translateX(0); } }\n        @keyframes anim-zoomIn { from { opacity: 0; transform: scale(0.6); } to { opacity: 1; transform: scale(1); } }\n        @keyframes anim-zoomInUp { from { opacity: 0; transform: scale(0.6) translateY(30px); } to { opacity: 1; transform: scale(1) translateY(0); } }\n        @keyframes anim-zoomInDown { from { opacity: 0; transform: scale(0.6) translateY(-30px); } to { opacity: 1; transform: scale(1) translateY(0); } }\n        @keyframes anim-bounceIn { from { opacity: 0; transform: scale(0.3); } 50% { transform: scale(1.05); } 70% { transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }\n        @keyframes anim-flipInX { from { opacity: 0; transform: perspective(400px) rotateX(90deg); } to { opacity: 1; transform: perspective(400px) rotateX(0); } }\n        @keyframes anim-flipInY { from { opacity: 0; transform: perspective(400px) rotateY(90deg); } to { opacity: 1; transform: perspective(400px) rotateY(0); } }\n      "}</style>
    </div>);
};
exports.GodCanvas = GodCanvas;
