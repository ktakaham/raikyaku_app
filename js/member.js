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

  // Register click handler for #request button
  $(function onDocReady() {
    WildRydes.authToken.then(function updateAuthMessage(token) {
      if (token) {
        displayUpdate(
          '認証されました.'
        );
        $(".authToken").text(token);
      }
    });

    if (!_config.api.invokeUrl) {
      $("#noApiMessage").show();
    }

    $.ajax({
      type: "GET", // 省略可（省略時は"GET"）
      url: _config.api.invokeUrl + "/user",
      headers: {
        Authorization: authToken,
      },
      dataType: "json",
    })
      .done(function (data) {
        var i = 0; //インデックス用
        $.each(data.result, function (key, item) {
          var tr;
          tr = $("<tr/>");
          tr.append('<th scope="row">' + key + "</td>");
          tr.append("<td>" + item.lastname + "</td>");
          tr.append("<td>" + item.firstname + "</td>");
          tr.append("<td>" + item.email + "</td>");
          $(".tables").append(tr);
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

  function displayUpdate(text) {
    $("#updates").append(
      $('<li class="list-group-item list-group-item-primary">' + text + "</li>")
    );
  }
})(jQuery);
