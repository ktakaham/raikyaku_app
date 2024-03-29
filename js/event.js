/*global WildRydes _config*/

var WildRydes = window.WildRydes || {};
WildRydes.map = WildRydes.map || {};

(function rideScopeWrapper($) {
  var authToken;
  WildRydes.authToken
    .then(function setAuthToken(token) {
      if (token) {
        authToken = token;
      } else {
        window.location.href = "/signin.html";
      }
    })
    .catch(function handleTokenError(error) {
      alert(error);
      window.location.href = "/signin.html";
    });

  function requestUnicorn(userData) {
    $.ajax({
      method: "POST",
      url: _config.api.invokeUrl + "/event",
      headers: {
        Authorization: authToken,
      },
      data: JSON.stringify({
        UserData: userData,
      }),
    })
      .done(function (data) {
        // 通信成功時のコールバック処理
        completeRequest();
      })
      .fail(function (jqXHR, textStatus, errorThrown) {
        alert("Ajax通信に失敗しました");
        console.log("ajax通信に失敗しました");
        console.log("XMLHttpRequest : " + jqXHR.status);
        console.log("textStatus     : " + textStatus);
        console.log("errorThrown    : " + errorThrown.message);
      });
  }

  function completeRequest(result) {
    console.log("Ajax通信が成功しました");
    window.location.href = "/done.html";
  }

  // Register click handler for #request button
  $(function onDocReady() {
    $("#submit").click(handleRequestClick);
    $("[name=church]").change(handleChurchListClick);

    WildRydes.authToken.then(function updateAuthMessage(token) {
      if (token) {
        displayUpdate("認証されました.");
        $(".authToken").text(token);
      }
    });

    if (!_config.api.invokeUrl) {
      $("#noApiMessage").show();
    }

    //ゲスト参加者記入欄
    $(document).on("click", ".add", function () {
      $(this).parent().clone(true).insertAfter($(this).parent());
    });
    $(document).on("click", ".del", function () {
      var target = $(this).parent();
      if (target.parent().children().length > 1) {
        target.remove();
      }
    });

    //教会リスト取得処理
    $.ajax({
      type: "GET", // 省略可（省略時は"GET"）
      url: _config.api.invokeUrl + "/church",
      headers: {
        Authorization: authToken,
      },
      dataType: "json",
    })
      .done(function (data) {
        var i = 0; //インデックス用
        $.each(data.result, function (key, item) {
          var tr;
          tr = $(
            '<option value="' +
              item.church_name +
              '">' +
              item.church_name +
              "</option>"
          );
          $("#churchInputform").append(tr);
          i++;
        });
      })
      .fail(function (jqXHR, textStatus, errorThrown) {
        console.log("ajax通信に失敗しました");
        console.log("XMLHttpRequest : " + jqXHR.status);
        console.log("textStatus     : " + textStatus);
        console.log("errorThrown    : " + errorThrown.message);
        console.log("authToken      : " + authToken);
        console.log("url            : " + _config.api.invokeUrl);
      });
  });

  //イベント登録処理
  function handleRequestClick(event) {
    var userData = WildRydes.map.selectedPoint;
    WildRydes.map.event_name = $("#eventInputform").val();
    WildRydes.map.church_name = $("#churchInputform").val();
    WildRydes.map.event_type = $("#eventTypeInputform").val();
    WildRydes.map.event_date = $("#eventdataInputform").val();
    var params = [];
    //event_nameに日時情報を追加してユニークID化させる
    var event_id = WildRydes.map.event_name + "_" + getNowYMDhmsStr();

    //イベントマスター情報登録
    params.push({
      event_id: event_id,
      user_id: event_id,
      event_name: WildRydes.map.event_name,
      event_date: WildRydes.map.event_date,
      event_type: WildRydes.map.event_type,
      church_name: WildRydes.map.church_name,
      master_flag: "1",
      guest_flag: "0",
    });

    //参加者情報登録
    $(".chk").each(function () {
      if (this.checked) {
        params.push({
          event_id: event_id,
          user_id: $(this).val(),
          event_name: WildRydes.map.event_name,
          event_date: WildRydes.map.event_date,
          event_type: WildRydes.map.event_type,
          church_name: WildRydes.map.church_name,
          master_flag: "0",
          guest_flag: "0",
        });
      }
    });

    //ゲスト参加者情報登録
    $(".chk_guest").each(function () {
      if ($(this).val()) {
        params.push({
          event_id: event_id,
          user_id: "guest_"+getNowYMDhmsStr()+"_"+$(this).val(),
          event_name: WildRydes.map.event_name,
          event_date: WildRydes.map.event_date,
          event_type: WildRydes.map.event_type,
          church_name: WildRydes.map.church_name,
          master_flag: "0",
          guest_flag: "1",
        });
      }
    });
    userData = params;
    event.preventDefault();
    requestUnicorn(userData);
  }

  //ユーザ取得処理
  function handleChurchListClick(event) {
    event.preventDefault();
    var church_para = $("#churchInputform").val();

    // ユーザ一覧取得
    $.ajax({
      type: "GET", // 省略可（省略時は"GET"）
      url: _config.api.invokeUrl + "/user?church=" + church_para,
      headers: {
        Authorization: authToken,
      },
      dataType: "json",
    })
      .done(function (data) {
        $(".membersList").empty();

        data.result.sort(function (a, b) {
          return a.lastname < b.lastname ? -1 : 1; //オブジェクトの昇順ソート
        });

        $.each(data.result, function (key, item) {
          var tr;
          tr = $('<label class="list-group-item">');
          tr.append(
            '<input type="checkbox" name="check" class="form-check-input chk" value="' +
              item.user_id +
              '">' +
              item.lastname +
              " " +
              item.firstname +
              "</label>"
          );
          $(".membersList").append(tr);
        });
      })
      .fail(function (jqXHR, textStatus, errorThrown) {
        console.log("ajax通信に失敗しました");
        console.log("XMLHttpRequest : " + jqXHR.status);
        console.log("textStatus     : " + textStatus);
        console.log("errorThrown    : " + errorThrown.message);
        console.log("authToken      : " + authToken);
        console.log("url            : " + _config.api.invokeUrl);
      });
  }

  function displayUpdate(text) {
    $("#updates").append(
      $('<li class="list-group-item list-group-item-primary">' + text + "</li>")
    );
  }

  function getNowYMDhmsStr() {
    const date = new Date();
    const Y = date.getFullYear();
    const M = ("00" + (date.getMonth() + 1)).slice(-2);
    const D = ("00" + date.getDate()).slice(-2);
    const h = ("00" + date.getHours()).slice(-2);
    const m = ("00" + date.getMinutes()).slice(-2);
    const s = ("00" + date.getSeconds()).slice(-2);

    return Y + M + D + h + m + s;
  }
})(jQuery);
