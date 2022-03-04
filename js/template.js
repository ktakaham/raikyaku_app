//**************************************
//ヘッダー
//**************************************
function header(){
    $.ajax({
        url: "/header.html",
        cache: false,
        success: function(html){
            document.write(html);
        }
    });
}
//**************************************
//フッター
//**************************************
// function footer(){
//     $.ajax({
//         url: 'footer.html',
//         cache: false,
//         async: false,
//         dataType: 'html',
//         success: function(html){
//             document.write(html);
//         }
//     });
// }