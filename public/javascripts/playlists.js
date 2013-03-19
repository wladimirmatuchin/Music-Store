$(function () {
    $('.playlist-delete').mousedown(showDeleteDialog);
    $('.playlist-create').mousedown(showCreateDialog);
    $('.playlist-package').mousedown(showPackageDialog);
});


function showDeleteDialog() {
    $('.playlist-delete-dialog .delete-title').text($(this).attr('plname'));
    $('.playlist-delete-dialog input').val($(this).attr('plid'));
    $('.playlist-delete-dialog').modal();
}

function showCreateDialog() {
    $('.playlist-create-dialog input[type="text"]').val('');
    $('.playlist-create-dialog').modal();
}

function showPackageDialog() {
    $(".playlist-package-dialog").modal();
}
