import "../scss/style.scss"

class DrawingBoard {
    MODE = "NONE"; // NONE BRUSH ERASER
    isMouseDown = false;
    eraserColor = "#FFFFFF";
    isNavigatorVisible = false;
    undoArray = [];
    containerEl;
    canvasEl;
    toolbarEl;
    brushEl;
    eraserEl;
    colorPickerEl;
    brushPanelEl;
    brushSliderEl;
    brushSizePreviewEl;
    navigatorEl;
    navigatorImageContainer;
    navigatorImageEl;
    undoEl;
    clearEl;
    downloadLinkEl;
    constructor() {
        this.assignElement();
        this.initContext();
        this.initCanvasBackGround();
        this.addEvent();
    }

    assignElement() {
        this.containerEl = document.getElementById("container");
        this.canvasEl = this.containerEl.querySelector("#canvas");
        this.toolbarEl = this.containerEl.querySelector("#toolbar");
        this.brushEl = this.toolbarEl.querySelector("#brush");
        this.eraserEl = this.toolbarEl.querySelector("#eraser");
        this.colorPickerEl = this.toolbarEl.querySelector("#colorPicker");
        this.brushPanelEl = this.containerEl.querySelector("#brushPanel");
        this.brushSliderEl = this.brushPanelEl.querySelector("#brushSize");
        this.brushSizePreviewEl = this.brushPanelEl.querySelector("#brushSizePreview");
        this.navigatorEl = this.toolbarEl.querySelector("#navigator");
        this.navigatorImageContainer = this.containerEl.querySelector("#imgNav");
        this.navigatorImageEl = this.navigatorImageContainer.querySelector("#canvasImg");
        this.undoEl = this.toolbarEl.querySelector("#undo");
        this.clearEl = this.toolbarEl.querySelector("#clear");
        this.downloadLinkEl = this.toolbarEl.querySelector("#download");
    }
    initContext() {
        this.context = this.canvasEl.getContext("2d");
    }
    initCanvasBackGround() {
        this.context.fillStyle = "#FFFFFF";
        this.context.fillRect(0, 0, this.canvasEl.width, this.canvasEl.height);
    }
    addEvent() {
        this.brushEl.addEventListener("click", this.onClickBrush.bind(this));
        this.canvasEl.addEventListener("mousedown", this.onMouseDown.bind(this));
        this.canvasEl.addEventListener("mousemove", this.onMouseMove.bind(this));
        this.canvasEl.addEventListener("mouseup", this.onMouseUp.bind(this));
        this.canvasEl.addEventListener("mouseout", this.onMouseOut.bind(this));
        this.brushSliderEl.addEventListener("input", this.onChangeBrushSize.bind(this));
        this.colorPickerEl.addEventListener("input", this.onChangeColor.bind(this));
        this.eraserEl.addEventListener("click", this.onClickEraser.bind(this));
        this.navigatorEl.addEventListener("click", this.onClickNavigator.bind(this));
        this.undoEl.addEventListener("click", this.onClickUndo.bind(this));
        this.clearEl.addEventListener("click", this.onClickClear.bind(this));
        this.downloadLinkEl.addEventListener("click", this.onClickDownload.bind(this));
    }
    onClickDownload(event) {
        this.downloadLinkEl.href = this.canvasEl.toDataURL("image/jpeg", 1);
        this.downloadLinkEl.download = "example.jpeg";
    }
    onClickClear(event) {
        this.context.clearRect(0, 0, this.canvasEl.width, this.canvasEl.height);
        this.undoArray.length = 0;
        this.updateNavigator();
        this.initCanvasBackGround();
    }
    onClickUndo(event) {
        if (this.undoArray.length === 0)    return;
        let previousDataUrl = this.undoArray.pop();
        let previousImage = new Image();
        previousImage.onload = () => {
            this.context.clearRect(0, 0, this.canvasEl.width, this.canvasEl.height);
            this.context.drawImage(previousImage, 0, 0, this.canvasEl.width, this.canvasEl.height, 0, 0, this.canvasEl.width, this.canvasEl.height);
        };
        previousImage.src = previousDataUrl;
    }
    saveState(event) {
        if (this.undoArray.length > 5)  this.undoArray.shift();
        this.undoArray.push(this.canvasEl.toDataURL());
    }
    onClickNavigator(event) {
        this.isNavigatorVisible = !event.currentTarget.classList.contains("active");
        event.currentTarget.classList.toggle("active");
        this.navigatorImageContainer.classList.toggle("hide");
        this.updateNavigator();
    }
    updateNavigator() {
        if (!this.isNavigatorVisible)   return;
        this.navigatorImageEl.src = this.canvasEl.toDataURL();
    }
    onClickEraser(event) {
        const isActive = event.currentTarget.classList.contains("active");
        this.MODE = isActive ? "NONE" : "ERASER";
        this.canvasEl.style.cursor = isActive ? "default" : "crosshair";
        this.brushPanelEl.classList.add("hide");
        event.currentTarget.classList.toggle("active");
        this.brushEl.classList.remove("active");
    }
    onMouseOut(event) {
        if (this.MODE === "NONE")   return;
        this.isMouseDown = false;
        this.updateNavigator();
    }
    onChangeColor(event) {
        this.brushSizePreviewEl.style.background = event.target.value;
    }
    onChangeBrushSize(event) {
        this.brushSizePreviewEl.style.width = `${event.target.value}px`;
        this.brushSizePreviewEl.style.height = `${event.target.value}px`;
    }
    onMouseUp(event) {
        if (this.MODE === "NONE")   return;
        this.isMouseDown = false;   
        this.updateNavigator();   
    }
    onMouseMove(event) {
        if (!this.isMouseDown)   return;
        const currentPosition = this.getMousePosition(event);
        this.context.lineTo(currentPosition.x, currentPosition.y);
        this.context.stroke();        
    }
    onMouseDown(event) {
        if (this.MODE === "NONE")   return;
        this.isMouseDown = true;
        const currentPosition = this.getMousePosition(event);
        this.context.beginPath();
        this.context.moveTo(currentPosition.x, currentPosition.y);
        this.context.lineCap = "round";
        if (this.MODE === "BRUSH") {
            this.context.strokeStyle = this.colorPickerEl.value;
            this.context.lineWidth = this.brushSliderEl.value;
        } else if (this.MODE === "ERASER") {
            this.context.strokeStyle = this.eraserColor;
            this.context.lineWidth = 50;
        }
        this.saveState();
    }
    getMousePosition (event) {
        const boundaries = this.canvasEl.getBoundingClientRect();
        return {
            x: event.clientX - boundaries.left,
            y: event.clientY - boundaries.top,
        }
    }
    onClickBrush(event) {
        const isActive = event.currentTarget.classList.contains("active");
        this.MODE = isActive ? "NONE" : "BRUSH";
        this.canvasEl.style.cursor = isActive ? "default" : "crosshair";
        this.brushPanelEl.classList.toggle("hide");
        event.currentTarget.classList.toggle("active");
        this.eraserEl.classList.remove("active");
    }
}
new DrawingBoard();