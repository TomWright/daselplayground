function toggleAbout() {
    $('#about').toggle();
}

function run() {
}

function share() {
}

function fileTypeChanged() {
    const fileType = $('#file-type').val()
    console.log('new file type: ', fileType)
    $('#arg-file-type').val(fileType)
}

function versionChanged() {
    const version = $('#version').val()
    console.log('new version: ', version)
}

$(document).ready(() => {
    $('.trigger-toggle-about').click(toggleAbout)
    $('.trigger-run').click(run)
    $('.trigger-share').click(share)
    $('#version').change(function() {
        versionChanged()
    })
    $('#file-type').change(function () {
        fileTypeChanged()
    })
});