/*
 * 縦横サイズ.jsx v0.3
 * Copyright (c) 2014 Yasutsugu Sasaki
 * Released under the MIT License.
 * http://opensource.org/licenses/mit-license.php
 */

#target "illustrator"
//#targetengine hogehoge

(function(){
    app.coordinateSystem = CoordinateSystem.ARTBOARDCOORDINATESYSTEM;   //座標の原点を各アートボードの左上にする。
    var keyState = ScriptUI.environment.keyboardState;  //キーボードイベント取得用
    var specLayer = null;   //指示表示用のレイヤー
    var lineLength = 10;
    var offset = 10;

    var offsetTxt_x = 8;    // 座標値テキストのx方向オフセット
    var offsetTxt_y = 2;    // 座標値テキストのy方向オフセット
    
    var colR = 255;
    var colG = 0;
    var colB = 0;
    
    var checkValue_h = true;    // チェックボックスの値判別用
    var checkValue_w = true;
    var sl;
    
    // ウィンドウダイアログを描画
    function addWindowPanel(){
        var winObj = new Window("dialog","Draw width and height",[100,50,300,200]);
        
        // RGBカラーを設定するテキストボックス
        winObj.add("statictext",[20,20,40,40],"R");
        var txtObj_r = winObj.add("edittext",[30,20,70,40],"255");
        
        winObj.add("statictext",[75,20,95,40],"G");
        var txtObj_g = winObj.add("edittext",[85,20,125,40],"0");
        
        winObj.add("statictext",[130,20,150,40],"B");
        var txtObj_b = winObj.add("edittext",[140,20,180,40],"0");
        
        // 縦と横のどちらを描画するかを指定するチェックボックス
        var checkbox_w = winObj.add("checkbox",[20,60,100,80],"width");
        var checkbox_h = winObj.add("checkbox",[20,80,100,100],"height");
        
        checkbox_h.value = checkbox_w.value = true;

        // 縦横サイズを描画実行するボタン
        var btnObj = winObj.add("button",[20,110,180,130],"Drow");
        btnObj.onClick = function() {
            
            //$.writeln("押されました");
            colR = Number(txtObj_r.text);
            colG = Number(txtObj_g.text);
            colB = Number(txtObj_b.text);
            checkValue_w = checkbox_w.value;
            checkValue_h = checkbox_h.value;
            
            for(var i = 0; i < sl; i++){
                drawSize(app.selection[i]);
            }
            
            // ボタン押下と同時に座標描画＆ウィンドウ閉じる
            winObj.close();
                             
        }
        winObj.show();
     }
   
    //指示表示用のレイヤーが無ければ追加
    function addSpecLayer(){
        for(var i = 0, il = app.activeDocument.layers.length; i < il; i++){ 
            if(app.activeDocument.layers[i].name == "Width and Height"){
                specLayer = app.activeDocument.layers[i];
                break;
            }
        }
        if(specLayer == null){
            specLayer = app.activeDocument.layers.add();
            specLayer.name = "Width and Height";
        }
    }

    //RGB色を設定
    function setColor(r, g, b){
        var rgbColor = new RGBColor();
        rgbColor.red = r;
        rgbColor.green = g;
        rgbColor.blue = b;
        return rgbColor;
    }

    //寸法線のスタイルを設定
    function setPathStyle(pathItem){
        pathItem.filled = false;
        pathItem.stroked = true;
        pathItem.strokeWidth = 1;
        pathItem.strokeColor = setColor(colR, colG, colB);
        pathItem.strokeCap = StrokeCap.BUTTENDCAP;
        pathItem.strokeJoin = StrokeJoin.MITERENDJOIN;
    }

    //数値のスタイルを設定
    function setTextStyle(textFrame){
        textFrame.textRange.characterAttributes.fillColor = setColor(colR, colG, colB);
        textFrame.textRange.characterAttributes.size = 11;
    }

    //縦横サイズの寸法線を描く
    function drawSize(obj){
        //$.writeln("呼ばれました");
        var fromX = Math.round(obj.geometricBounds[0]), toX = Math.round(obj.geometricBounds[2]);
        //Y座標は符号を反転させる
        var fromY = -Math.round(obj.geometricBounds[1]), toY = -Math.round(obj.geometricBounds[3]);
        
        //Width
        //widthチェックボックスがtrueだったら描画
        if(checkValue_w){
            var widthGroup = specLayer.groupItems.add();
            var widthLine = widthGroup.pathItems.add();
            setPathStyle(widthLine);
            var widthText = widthGroup.textFrames.add();
            widthText.contents = toX - fromX;
            setTextStyle(widthText);
            widthText.paragraphs[0].paragraphAttributes.justification = Justification.CENTER;
         }
            
        //height
        //heightチェックボックスがtrueだったら描画
        if(checkValue_h){
            var heightGroup = specLayer.groupItems.add();
            var heightLine = heightGroup.pathItems.add();
            setPathStyle(heightLine);
            var heightText = heightGroup.textFrames.add();
            heightText.contents = toY - fromY;
            setTextStyle(heightText);
            heightText.paragraphs[0].paragraphAttributes.justification = Justification.RIGHT;
        }
        
        //コントロールキーが押されていたらアートボード外に寸法線を描く
        if(keyState.ctrlKey){
            //Width
            //widthチェックボックスがtrueだったら描画
            if(checkValue_w){
            widthLine.setEntirePath ([[fromX, -(fromY + lineLength)], [fromX, offset], [toX, offset], [toX, -(fromY + lineLength)]]);
            widthText.position = [fromX + (toX - fromX) / 2 - widthText.width / 2, offset + widthText.height + offsetTxt_y];
            }
        
            //height
            //heightチェックボックスがtrueだったら描画
            if(checkValue_h){
                heightLine.setEntirePath ([[fromX + lineLength, -fromY], [-offset, -fromY], [-offset, -toY], [fromX + lineLength, -toY]]);
                heightText.position = [-offset - heightText.width - offsetTxt_x, -(fromY + (toY - fromY) / 2 - heightText.height / 2)];
            }
        } else {
            //Width
            //widthチェックボックスがtrueだったら描画
            if(checkValue_w){
                widthLine.setEntirePath ([[fromX, -(fromY + lineLength)], [fromX, -(fromY - offset)], [toX, -(fromY - offset)], [toX, -(fromY + lineLength)]]);
                widthText.position = [fromX + (toX - fromX) / 2 - widthText.width / 2 , -(fromY - offset - widthText.height - offsetTxt_y)];
            }
            
            //height
            //heightチェックボックスがtrueだったら描画
            if(checkValue_h){
                heightLine.setEntirePath ([[fromX + lineLength, -fromY], [fromX - offset, -fromY], [fromX - offset, -toY], [fromX + lineLength, -toY]]);
                heightText.position = [fromX -offset - heightText.width - offsetTxt_x, -(fromY + (toY - fromY) / 2 - heightText.height / 2)];
            }
        }
    }

    //main
    try {
        if (app.documents.length > 0 ) {
            sl = app.selection.length;
            if(sl > 0){
                
                addSpecLayer();
                addWindowPanel();
                
                /*for(var i = 0; i < sl; i++){
                    drawSize(app.selection[i]);
                }*/
            
            } else {
                throw new Error('オブジェクトを選んでから実行してください。');
            }
        }
        else{
            throw new Error('ドキュメントが開かれていません。');
        }
    }
    catch(e) {
        alert( e.message, "スクリプト警告", true);
    }
})()