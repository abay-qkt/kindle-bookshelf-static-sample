var cstate = false;
// var book_list = []
// var series_list = []

var imgsize_slider;

var is_grid = true;

// オプションバーの設定
draw_option_bar();
document.getElementById("hidden_buttons").style.display = "none"

$(function() { //ヘッダーの高さ分だけコンテンツを下げる
  var height=$(".status_bar").height();
  $(".shelf_wrapeper").css("margin-top", height);
});

// if(series_shelf_id==""){
//   call_api("get_book_info");
// }else{
//   get_one_series();
// }
draw_shelf();

var disable_ids = ["edit_mode_check","edit_mode_apply"
                  ,"sort_dd","asc_dd","keyword_box","query_box"
                  ,"apply1","apply2"];
for(did of disable_ids){
  document.getElementById(did).disabled = true;
}

//////////////////////////////////////////////////////////////////////////////////////

// 表示列数を指定してCSSに反映
function edit_style(colnum){
  $('.grid_wrapper').css({
      "grid-template-columns": "repeat("+colnum+", 1fr)"
  });
}

// 表紙画像の高さを設定
function edit_book_size(size){
  $('.horizontal_scroll_wrap').css({
    "height": size+"px",
    "padding": size*0.05+"px"
  });
  $('.scroll_item').css({
    "margin-right": size*0.03125+"px"
  });
  $('.serial_item').css({
    "width": size*0.6+"px",
  });
}

// GUIの表示
function draw_option_bar(){
  // GUIの表示非表示切り替え
  document.getElementById("hide_button").onclick = function(){
    cstate = !cstate

    $(function() { //ヘッダーの高さ分だけコンテンツを下げる
      var height=$(".status_bar").height();
      $(".shelf_wrapeper").css("margin-top", height + 10);//10pxだけ余裕をもたせる
    });
    if(cstate){
      document.getElementById("hidden_buttons").style.display = "block"
    }else{
      document.getElementById("hidden_buttons").style.display = "none"
    }
  }

  if(series_shelf_id==""){ // 全シリーズ表示する本棚の場合
    // カラム数ドロップダウン
    var select_colnum = document.getElementById("colnum_dd")
    for(var i=1;i<10;i++){
      var option_colnum =  document.createElement("option");
      option_colnum.setAttribute("value",i);
      option_colnum.innerHTML = i
      select_colnum.appendChild(option_colnum);
    }
    select_colnum[2].selected = true
    select_colnum.onchange = function(){
      // 選択されているoption要素を取得する
      var selectedItem = this.options[ this.selectedIndex ];
      edit_style(selectedItem.value);
    }

    // ソートキーのドロップダウン
    var select_sort = document.getElementById("sort_dd");
    var sort_keys = ["rating","series_pron","author_pron","purchases",
                    "oldest_publication","latest_publication",
                    "oldest_purchase","latest_purchase",
                    "early_purchase","late_purchase"]
    for(var key of sort_keys){
      var option_sort =  document.createElement("option");
      option_sort.setAttribute("value",key);
      option_sort.innerHTML = key
      select_sort.appendChild(option_sort);
    }
    select_sort.options[0].selected = true
    select_sort.onchange = send_query;

    // 昇順降順のドロップダウン
    var select_asc = document.getElementById("asc_dd");
    var asc_dict = {"DESC":"0","ASC":"1"};
    for(var key of Object.keys(asc_dict)){
      var option_asc = document.createElement("option")
      option_asc.innerHTML = key
      option_asc.setAttribute("value",asc_dict[key])
      select_asc.appendChild(option_asc)
    }
    select_asc.options[0].selected = true
    select_asc.onchange = send_query;

    // キーワードのテキストボックス
    var inputtext_keywords = document.getElementById("keyword_box")
    inputtext_keywords.onkeyup = function(){
      if( window.event.keyCode == 13 ){
        send_query();
      }
    };

    // クエリのテキストボックス
    var inputtext_query = document.getElementById("query_box")
    inputtext_query.onkeyup = function(){
      if( window.event.keyCode == 13 ){
        send_query();
      }
    };

  }else{  // 一つのシリーズのみを表示する本棚の場合
    is_grid = false
    document.getElementById("bookshelf").className = "serial_wrapper"
  }

  // 画像サイズのスライダー
  imgsize_slider = document.getElementById("imgsize_slider");
  imgsize_slider.addEventListener('input',(e)=>edit_book_size(imgsize_slider.value));
}

function make_image_url(asin){
  var image_url = 'https://images-na.ssl-images-amazon.com/images/P/'+asin+'.01._SX255_SY255_TTXW_SCLZZZZZZZ_.jpg';
  return image_url
}

function make_browser_url(asin){
  var browser_url = 'https://www.amazon.co.jp/gp/product/'+asin;
  return browser_url;
}

function draw_shelf(){
  document.getElementById("bookshelf").innerHTML=""
  for(var i in series_list){
    var series_id = series_list[i].series_id
    var series_books = book_list.filter(function(bdl){
      return bdl["series_id"] == series_id
    });

    var series_link_url = local_url+"/series_shelf?series_id="+series_id;
    if(is_grid){ // グリッド表示の場合
      // シリーズ一つ分の棚
      var div_oneshelf = document.createElement('div');
      div_oneshelf.setAttribute("id","hsw_"+series_id);
      div_oneshelf.setAttribute("class","horizontal_scroll_wrap");

      // // シリーズページへのリンク
      // var a_series_link = document.createElement('a');
      // a_series_link.setAttribute("id","series_link_"+series_id);
      // a_series_link.setAttribute("class","hidden_series_link");
      // a_series_link.setAttribute("href",series_link_url);
      // a_series_link.setAttribute("target","_blank");
      // a_series_link.setAttribute("rel","noopener");
      // div_oneshelf.appendChild(a_series_link)

      // 評価情報ボックス
      var div_param_box = document.createElement('div');
      div_param_box.setAttribute("id","series_param_"+series_id);
      div_param_box.setAttribute("class","param_box");
      div_oneshelf.appendChild(div_param_box)

      // 棚の中身リスト
      var ul_scroll_lst = document.createElement('ul');
      ul_scroll_lst.setAttribute("class","scroll_lst");
      for(var j in series_books){
        var asin = series_books[j]["ASIN"]
        // 本一冊
        var li_scroll_item = document.createElement('li');
        li_scroll_item.setAttribute("class","scroll_item");

        // カバー
        var browser_url = make_browser_url(asin);
        var a_cover = document.createElement('a');
        a_cover.setAttribute("class","cover");
        a_cover.setAttribute("href",browser_url);
        a_cover.setAttribute("asin",asin);
        a_cover.setAttribute("series_id",series_id);
        a_cover.setAttribute("target","_brank");

        // カバー画像
        var image_url = make_image_url(asin);
        var img_cover = document.createElement('img');
        img_cover.setAttribute("src",image_url)

        a_cover.appendChild(img_cover)
        li_scroll_item.appendChild(a_cover)
        ul_scroll_lst.appendChild(li_scroll_item)
        div_oneshelf.appendChild(ul_scroll_lst)

        if(j>0){
          li_scroll_item.classList.add("continued")
        }else{
          li_scroll_item.classList.add("first")
        }
      }
      document.getElementById("bookshelf").appendChild(div_oneshelf)
    }else{  // シリアル表示の場合
      for(var j in series_books){
        var asin = series_books[j]["ASIN"]
        var serial_item = document.createElement('div');
        serial_item.setAttribute("class","serial_item");

        // カバー画像
        var browser_url = make_browser_url(asin);
        var a_cover = document.createElement('a');
        a_cover.setAttribute("class","cover_w");
        a_cover.setAttribute("href",browser_url);
        a_cover.setAttribute("asin",asin);
        a_cover.setAttribute("series_id",series_id);
        a_cover.setAttribute("target","_brank");

        var image_url = make_image_url(asin);
        var img_cover = document.createElement('img');
        img_cover.setAttribute("src",image_url)

        a_cover.appendChild(img_cover)
        serial_item.appendChild(a_cover)
        document.getElementById("bookshelf").appendChild(serial_item)
        if(j>0){
          serial_item.classList.add("continued")
        }else{
          serial_item.classList.add("first")
        }
      }
    }
  }

  // 再描画により改変されたCSSが適用されなくなるため、設定しなおす
  edit_book_size(imgsize_slider.value)
  switch_show_all()


  if(is_grid){
    // rating表示状態を前回と同様にする
    switch_show_rating()

    // 慣性スクロール設定
    // Copyright (c) 2020 https://www.it-the-best.com https://www.it-the-best.com/entry/jquery-plugin-mousedragscroll
    $(".scroll_lst").setListmousedragscroll({"inertia":true,"loop":false});
  }
}

// グリッド表示とシリアル表示の切り替え
function switch_shelf(){
  is_grid = !is_grid
  document.getElementById("bookshelf").classList.toggle("grid_wrapper")
  document.getElementById("bookshelf").classList.toggle("serial_wrapper")
  draw_shelf()
}

// 評価情報ボックスの描画
function draw_rating(){
  var tabindex=100;
  for(var series_i of series_list){
      var table_param = document.createElement("table")
      table_param.setAttribute("class","param_table")
      var param_names = ["rating","tags"];
      for(var param_name of param_names){
        var tr_param = document.createElement("tr")
        var td_param_name = document.createElement("td")
        td_param_name.innerHTML = param_name
        var td_input_param = document.createElement("td")
        var input_param = document.createElement("input")
        input_param.setAttribute("type","text")
        input_param.setAttribute("value",series_i[param_name])
        input_param.setAttribute("id",series_i.series_id+'_'+param_name)
        input_param.setAttribute("tabindex",tabindex)
        input_param.setAttribute("size",10)
        input_param.setAttribute("onfocus","this.select();")
        td_input_param.appendChild(input_param)

        tr_param.appendChild(td_param_name)
        tr_param.appendChild(td_input_param)

        table_param.appendChild(tr_param)
        tabindex += 1;
      }
      document.getElementById('series_param_'+series_i.series_id).appendChild(table_param)
  }
}

// 評価情報ボックスの表示/非表示切り替え
function switch_show_rating(){
  var related_ids = ["switchshelf_btn"
                    ,"sort_dd","asc_dd","keyword_box","query_box"
                    ,"apply1","apply2"]
  if(document.getElementById("edit_mode_check").checked){
    for(rid of related_ids){
      document.getElementById(rid).disabled = true;
    }
    $('.param_box').css({"display": "block"});
  }else{// 編集表示を消す
    for(rid of related_ids){
      document.getElementById(rid).disabled = false;
    }
    $('.param_box').css({"display": "none"});
  }
}

function switch_show_all(){
  if(document.getElementById("show_all_mode").checked){
    for(var item of document.getElementsByClassName("first")){
      var a_cover = item.childNodes[0];
      var asin = a_cover.getAttribute("asin");
      var browser_url = make_browser_url(asin);
      a_cover.setAttribute("href",browser_url);
    }
    $('.continued').css({
      "display": "inline-block"
    });
  }else{
    for(var item of document.getElementsByClassName("first")){
      var a_cover = item.childNodes[0];
      var series_id = a_cover.getAttribute("series_id");
      var series_link_url = local_url+"/series_shelf?series_id="+series_id;
      // a_cover.setAttribute("href",series_link_url);
    }
    $('.continued').css({
      "display": "none"
    });
  }
}

// 評価情報を送信
function update_rating(){
  for(i in series_list){
      elm = series_list[i]
      if(document.getElementById(elm.series_id+"_rating")==null){continue}
      elm.rating = Number(document.getElementById(elm.series_id+"_rating").value) // Number()は数字以外が入っているとnullになる
      elm.tags = document.getElementById(elm.series_id+"_tags").value
      elm.tags = elm.tags=="null" ? null:elm.tags // tagsは文字列にしているため、nullを文字列としてとってしまうので変換。
  }
  edit_series_review({"series_param":series_list});
}

// オプションバーから設定値を取得しクエリを投げる
function send_query(){
  var sort_key = document.getElementById("sort_dd").value
  var is_asc  = document.getElementById("asc_dd").value
  var keywords = document.getElementById("keyword_box").value
  var query = document.getElementById("query_box").value
  data_dict = {
    "sort_keys":sort_key,
    "is_asc":is_asc,
    "keywords":keywords,
    "query":query
  }
  call_api("get_book_info",arg_data={"data":data_dict})
}

function get_one_series(){
  data_dict = {
    "query":"series_id=='"+series_shelf_id+"'"
  }
  call_api("get_book_info",arg_data={"data":data_dict})
}

// データをロードし、結果を描画する
function call_api(api,arg_data={"data":null}){
  console.log(arg_data)
  $.ajax({
      type: 'POST',
      url : local_url+"/"+api,
      data: JSON.stringify(arg_data),
      contentType:'application/json'
  }).done(function(res,textStatus,jqXHR){
      book_list = res["book"];
      series_list = res["series"];
      draw_shelf();
      draw_rating();
  }).fail(function(jqXHR, textStatus, errorThrown) {
      console.log(textStatus,jqXHR,errorThrown);
      console.log(jqXHR);
      console.log(errorThrown);
      alert(textStatus);
      });
}

// 評価情報を編集し、再描画する
function edit_series_review(series_dl_js){
  $.ajax({
      type: 'POST',
      url : local_url+'/edit_series_review',
      data: JSON.stringify(series_dl_js),
      contentType:'application/json'
    }).done(function(res,textStatus,jqXHR){
      send_query();
  }).fail(function(jqXHR, textStatus, errorThrown) {
      console.log(textStatus);
      console.log(jqXHR);
      console.log(errorThrown);
      alert(textStatus);
      });
}
