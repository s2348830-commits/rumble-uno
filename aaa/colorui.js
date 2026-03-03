const ColorUI = {
    // パネルを表示
    show: function() {
        document.getElementById('color-selector').classList.remove('hidden');
    },

    // パネルを非表示
    hide: function() {
        document.getElementById('color-selector').classList.add('hidden');
    }
};

// HTMLのボタンから呼ばれる関数
function handleColorSelect(color) {
    ColorUI.hide();
    // main.js側に定義する「色決定後の処理」を呼び出す
    onColorChosen(color);
}