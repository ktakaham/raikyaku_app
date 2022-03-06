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
      url: _config.api.invokeUrl + "/ride",
      headers: {
        Authorization: authToken,
      },
      data: JSON.stringify({
        UserData: {
          email: userData.email,
          lastname: userData.lastname,
          firstname: userData.firstname,
          tel: userData.tel,
          postcode: userData.postcode,
          prefecture: userData.prefecture,
          city: userData.city,
          address: userData.address,
          apartname: userData.apartname,
          occupation: userData.occupation,
          church: userData.church,
          birthyear: userData.birthyear,
          birthmonth: userData.birthmonth,
          birthday: userData.birthday,
        },
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

    WildRydes.authToken.then(function updateAuthMessage(token) {
      if (token) {
        displayUpdate(
          '認証されました. トークンを確認（ <a href="#authTokenModal" data-toggle="modal">auth token</a>）.'
        );
        $(".authToken").text(token);
      }
    });

    if (!_config.api.invokeUrl) {
      $("#noApiMessage").show();
    }

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

  function handleRequestClick(event) {

    // validateCheck(event);
    var userData = WildRydes.map.selectedPoint;
    WildRydes.map.email = $("#mailInputform").val();
    WildRydes.map.lastname = $("#nameInputform").val();
    WildRydes.map.firstname = $("#firstnameInputform").val();
    WildRydes.map.tel = $("#telInputform").val();
    WildRydes.map.postcode = $("#postcodeInputform").val();
    WildRydes.map.prefecture = $("#prefInputform").val();
    WildRydes.map.city = $("#cityInputform").val();
    WildRydes.map.address = $("#addressInputform").val();
    WildRydes.map.apartname = $("#apartnameInputform").val();
    WildRydes.map.occupation = $("#occupationInputform").val();
    WildRydes.map.church = $("#churchInputform").val();
    WildRydes.map.birthyear = $("#birthyearInputform").val();
    WildRydes.map.birthmonth = $("#birthmonthInputform").val();
    WildRydes.map.birthday = $("#birthdayInputform").val();
    userData = WildRydes.map;
    console.log("post check");

    event.preventDefault();
    requestUnicorn(userData);
  }

  // function validateCheck(event) {
  //   const forms = document.querySelectorAll(".needs-validation");
  //   console.log("validate check");

  //   Array.prototype.slice.call(forms).forEach((form) => {
  //     if (!form.checkValidity()) {
  //       event.preventDefault();
  //       event.stopPropagation();
  //     }
  //     form.classList.add("was-validated");
  //   });
  // }

  function displayUpdate(text) {
    $("#updates").append(
      $('<li class="list-group-item list-group-item-primary">' + text + "</li>")
    );
  }
})(jQuery);
