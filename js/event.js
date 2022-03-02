/*global WildRydes _config*/

var WildRydes = window.WildRydes || {};
WildRydes.map = WildRydes.map || {};

(function rideScopeWrapper($) {
	var authToken;
	WildRydes.authToken.then(function setAuthToken(token) {
		if (token) {
			authToken = token;
		}
		else {
			window.location.href = '/signin.html';
		}
	}).catch(function handleTokenError(error) {
		alert(error);
		window.location.href = '/signin.html';
	});

	// Register click handler for #request button
	$(function onDocReady() {
		WildRydes.authToken.then(function updateAuthMessage(token) {
			if (token) {
				displayUpdate('認証されました. トークンを確認（ <a href="#authTokenModal" data-toggle="modal">auth token</a>）.');
				$('.authToken').text(token);
			}
		});

		if (!_config.api.invokeUrl) {
			$('#noApiMessage').show();
		}

		$.ajax({
			type: 'GET', // 省略可（省略時は"GET"）
			url: _config.api.invokeUrl + '/user',
			headers: {
				Authorization: authToken
			},
			dataType: 'json'
		})
			.done(function (data) {
				var i = 0; //インデックス用
				$.each(data.result, function (key, item) {
					var tr;
					tr = $("<label class=\"list-group-item\">");
					tr.append("<input type=\"checkbox\" class=\"form-check-input mr-2\" value=\"" + item.user_id + "\">" + item.lastname + " " + item.firstname + "</label>");
					$('.membersList').append(tr);
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

		$.ajax({
			type: 'GET', // 省略可（省略時は"GET"）
			url: _config.api.invokeUrl + '/church',
			headers: {
				Authorization: authToken
			},
			dataType: 'json'
		})
			.done(function (data) {
				var i = 0; //インデックス用
				$.each(data.result, function (key, item) {
					var tr;
					tr = $("<option value=\"" + item.church_name + "\">" + item.church_name + "</option>");
					$('#churchInputform').append(tr);
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
		$('#updates').append($('<li class="list-group-item list-group-item-primary">' + text + '</li>'));
	}
}(jQuery));
