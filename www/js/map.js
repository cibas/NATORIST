//OSMの描画
function writemap(lat,lon) {
    map = new OpenLayers.Map("canvas");
    var mapnik = new OpenLayers.Layer.OSM();
    map.addLayer(mapnik);
    console.log(lat+":"+lon+":");
    var lonLat = new OpenLayers.LonLat(lat,lon)
        .transform(
            new OpenLayers.Projection("EPSG:4326"), 
            new OpenLayers.Projection("EPSG:900913")
        );
    map.setCenter(lonLat, 15);
    var markers = new OpenLayers.Layer.Markers("Markers");
    map.addLayer(markers);

    var marker = new OpenLayers.Marker(
    new OpenLayers.LonLat(lat,lon)
        .transform(
            new OpenLayers.Projection("EPSG:4326"), 
            new OpenLayers.Projection("EPSG:900913")
        )
    );
    markers.addMarker(marker);
}



//OSMの描画時に位置情報取得に成功した場合のコールバック
function onGeoSuccess(position){
    current = new CurrentPoint();    
    current.geopoint = position.coords; //位置情報を保存する
    writemap(current.geopoint.longitude,current.geopoint.latitude);
};

//位置情報取得に失敗した場合のコールバック
function onGeoError(error){
    console.log("現在位置を取得できませんでした");
      switch(error.code) {
        case 1: //PERMISSION_DENIED
          alert("位置情報の利用が許可されていません");
          break;
        case 2: //POSITION_UNAVAILABLE
          alert("現在位置が取得できませんでした");
          break;
        case 3: //TIMEOUT
          alert("タイムアウトになりました");
          break;
        default:
          alert("その他のエラー(エラーコード:"+error.code+")");
          break;
      }
};

//位置情報取得時に設定するオプション
var geoOption = {
    timeout: 6000
};

//現在地を保持するクラスを作成
function CurrentPoint(){
    geopoint=null;  //端末の位置情報を保持する
}

//現在地をポイントとして登録する
 function save_geopoint(){
     //alert("save_geopoint");
     navigator.geolocation.getCurrentPosition(onSaveSuccess, onGeoError, geoOption);
     console.log("save_geopoint");
}

//ポイントの登録時に位置情報取得に成功した場合のコールバック
function onSaveSuccess(location){
        navigator.notification.prompt(
            ' ',  // メッセージ
            onPrompt,                  // 呼び出すコールバック
            'ポンイントの登録',            // タイトル
            ['登録','やめる'],             // ボタンのラベル名
            'ポイント名'                 // デフォルトのテキスト
        );

        function onPrompt(results) {
            current.geopoint = location.coords; 
            var geoPoint = new ncmb.GeoPoint(location.coords.latitude, location.coords.longitude);
            console.log(location.coords.latitude + ":" + location.coords.longitude);
            var Places = ncmb.DataStore("PlacePoints");
            var point = new Places();
            point.set("name",results.input1);
            point.set("geo", geoPoint);

            point.save()
            .then(function(){})
            .catch(function(err){// エラー処理
            });
        }

    };

//登録されたポイントを引き出し地図上に表示する
function find_geopoint(){
    //alert("find_geopoint");
    navigator.geolocation.getCurrentPosition(onFindSuccess, onGeoError, geoOption);
    console.log("find_geopoint");
}

//登録ポイントの表示時に位置情報取得に成功した場合のコールバック
function onFindSuccess(location){
        current.geopoint = location.coords; 
        var geoPoint = new ncmb.GeoPoint(location.coords.latitude, location.coords.longitude);
        console.log("findpoints:"+location.coords.latitude + ":" + location.coords.longitude);
        var PlacePointsClass = ncmb.DataStore("PlacePoints");
        //ニフティクラウド mobile backendにアクセスして検索開始位置を指定
        PlacePointsClass.withinKilometers("geo", geoPoint, 5)
                        .fetchAll()
                        .then(function(results){
                            var data = [];
                            for (var i = 0; i < results.length; i++) {
                                var result = results[i];
                                var markers = new OpenLayers.Layer.Markers("Markers");
                                map.addLayer(markers);
                                var regist_location = result.get("geo");
                                var marker = new OpenLayers.Marker(
                                    new OpenLayers.LonLat(regist_location.longitude,regist_location.latitude)
                                                .transform(
                                                new OpenLayers.Projection("EPSG:4326"), 
                                                new OpenLayers.Projection("EPSG:900913")
                                            )
                                );
                                markers.addMarker(marker);
                            }
                        });

    };
