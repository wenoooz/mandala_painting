const canvas = document.getElementById("coloringCanvas");
const ctx = canvas.getContext("2d");
const swatches = document.querySelectorAll('.color-swatch');
const brushSizeInput = document.getElementById("brushSize");
const brushSizeValue = document.getElementById("brushSizeValue");
const undoButton = document.getElementById("undo");
const clearButton = document.getElementById("clear");
const imageButtons = document.querySelectorAll(".image-btn");
const customColorPicker = document.getElementById("customColorPicker");
const bgMusic = document.getElementById("bgMusic");

let currentColor = "#FF0000";
let brushSize = 10;
let isDrawing = false;
let historyStack = [];

const img = new Image();
img.src = "art1.png";

img.onload = () => {
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    saveState();
};

//自动播放音乐
window.addEventListener("DOMContentLoaded", () => {
    bgMusic.play().catch(err => console.log("音乐自动播放失败:", err));
});


// 多图切换
imageButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        img.src = btn.dataset.img;
        img.onload = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            historyStack = [];
            saveState();
        };
    });
});

// 刷子大小控制
brushSizeInput.addEventListener('input', (e) => {
    brushSize = e.target.value;
    brushSizeValue.textContent = brushSize;
});

// 色块点击
swatches.forEach(swatch => {
    swatch.addEventListener('click', () => {
        swatches.forEach(s => s.classList.remove('active'));
        swatch.classList.add('active');
        currentColor = swatch.getAttribute('data-color');
    });
});

// 自定义颜色
customColorPicker.addEventListener('input', (e) => {
    swatches.forEach(s => s.classList.remove('active'));
    currentColor = e.target.value;
});

// 画布事件
canvas.addEventListener('mousedown', (e) => {
    isDrawing = true;
    saveState(); // 每次绘制前保存状态
    draw(e);
});

canvas.addEventListener('mousemove', (e) => {
    if (isDrawing) draw(e);
});

canvas.addEventListener('mouseup', () => {
    isDrawing = false;
});

// 画图
function draw(e) {
    ctx.fillStyle = currentColor;
    ctx.beginPath();
    ctx.arc(e.offsetX, e.offsetY, brushSize / 2, 0, Math.PI * 2);
    ctx.fill();
}

// 修复撤销功能
undoButton.addEventListener('click', () => {
    if (historyStack.length > 1) {
        historyStack.pop();
        ctx.putImageData(historyStack[historyStack.length - 1], 0, 0);
    } else {
        console.log("无法撤销，没有更多历史记录");
    }
});

// 清除功能
clearButton.addEventListener('click', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    historyStack = [];
    saveState();
});

// 修复撤销历史保存
function saveState() {
    if (historyStack.length === 0 || !compareImageData(ctx.getImageData(0, 0, canvas.width, canvas.height), historyStack[historyStack.length - 1])) {
        historyStack.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
        if (historyStack.length > 20) historyStack.shift(); // 只保留 20 步撤销
    }
}

// 防止重复存储相同状态
function compareImageData(imgData1, imgData2) {
    if (!imgData1 || !imgData2) return false;
    return imgData1.data.every((value, index) => value === imgData2.data[index]);
}