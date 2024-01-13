<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">
<html class="p100">
 <head>
  <meta http-equiv="content-type" content="text/html; charset=UTF-8">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black">
  <meta name="format-detection" content="telephone=no">
  <meta name="viewport" content="width=500, user-scalable=no">
  <link rel="manifest" href="cstimer.webmanifest">
<?php include('lang/langDet.php');?>
  <link rel='stylesheet' type='text/css' href='css/style.css'>
     <link rel='stylesheet' type='text/css' href='css/cstimer.css'>
     <link rel='stylesheet' type='text/css' href='css/feather.css'>
  <script type="text/javascript" src="js/lib/jquery-1.8.0.js"></script>
  <script type="text/javascript" src="js/lib/utillib.js"></script>
  <script type="text/javascript" src="js/lib/sha256.js"></script>
  <script type="text/javascript" src="js/lib/mersennetwister.js"></script>
  <script type="text/javascript" src="js/lib/mathlib.js"></script>
  <script type="text/javascript" src="js/lib/sbtree.js"></script>
  <script type="text/javascript" src="js/lib/sqlfile.js"></script>
  <script type="text/javascript" src="js/lib/tdconverter.js"></script>
  <script type="text/javascript" src="js/lib/lzstring.js"></script>
  <script type="text/javascript" src="js/lib/min2phase.js"></script>
  <script type="text/javascript" src="js/lib/cubeutil.js"></script>
  <script type="text/javascript" src="js/lib/json.min.js"></script>
  <script type="text/javascript" src="js/kernel.js"></script>
  <script type="text/javascript" src="js/export.js"></script>
  <script type="text/javascript" src="js/logohint.js"></script>
  <script type="text/javascript" src="js/timer.js"></script>
  <script type="text/javascript" src="js/scramble/scramble.js"></script>
  <script type="text/javascript" src="js/scramble/megascramble.js"></script>
  <script type="text/javascript" src="js/scramble/scramble_333_edit.js"></script>
  <script type="text/javascript" src="js/scramble/scramble_444.js"></script>
  <script type="text/javascript" src="js/scramble/scramble_sq1_new.js"></script>
  <script type="text/javascript" src="js/scramble/pyraminx.js"></script>
  <script type="text/javascript" src="js/scramble/skewb.js"></script>
  <script type="text/javascript" src="js/scramble/2x2x2.js"></script>
  <script type="text/javascript" src="js/scramble/gearcube.js"></script>
  <script type="text/javascript" src="js/scramble/1x3x3.js"></script>
  <script type="text/javascript" src="js/scramble/2x2x3.js"></script>
  <script type="text/javascript" src="js/scramble/clock.js"></script>
  <script type="text/javascript" src="js/scramble/333lse.js"></script>
  <script type="text/javascript" src="js/scramble/utilscramble.js"></script>
  <script type="text/javascript" src="js/lib/storage.js"></script>
  <script type="text/javascript" src="js/stats/timestat.js"></script>
  <script type="text/javascript" src="js/stats/stats.js"></script>
  <script type="text/javascript" src="js/tools/tools.js"></script>
  <script type="text/javascript" src="js/tools/image.js"></script>
  <script type="text/javascript" src="js/tools/cross.js"></script>
  <script type="text/javascript" src="js/tools/eoline.js"></script>
  <script type="text/javascript" src="js/tools/roux1.js"></script>
  <script type="text/javascript" src="js/tools/gsolver.js"></script>
  <script type="text/javascript" src="js/tools/bluetoothutil.js"></script>
  <script type="text/javascript" src="js/tools/metronome.js"></script>
  <script type="text/javascript" src="js/tools/syncseed.js"></script>
  <script type="text/javascript" src="js/shortcut.js"></script>
  <script type="text/javascript" src="js/help.js"></script>
  <script type="text/javascript" src="js/stackmat.js"></script>
  <script type="text/javascript" src="js/tools/stackmatutil.js"></script>
  <script type="text/javascript" src="js/bluetooth.js"></script>
  <script type="text/javascript" src="js/worker.js"></script>
  <script type="text/javascript" src="js/lib/threemin.js"></script>
  <script type="text/javascript" src="js/twisty/twisty.js"></script>
  <script type="text/javascript" src="js/twisty/twistynnn.js"></script>
  <script type="text/javascript" src="js/twisty/twistysq1.js"></script>
  <script type="text/javascript" src="js/twisty/twistyskb.js"></script>
  <script type="text/javascript" src="js/twisty/twistypyra.js"></script>
  <script type="text/javascript" src="js/twisty/twistyminx.js"></script>
  <script type="text/javascript" src="js/twisty/qcube.js"></script>
     <script src="js/scrambles/pbls.js" type="module"></script>
<script src="js/scrambles/sq2.js" type="module"></script>
<script src="js/scrambles/fto.js" type="module"></script>
<script src="js/scrambles/kilom.js" type="module"></script>
<script src="js/scrambles/guildford.js" type="module"></script>
<script src="js/scrambles/observer.js" type="module"></script>
<script src="js/scrambles/clock.js" type="module"></script>
<script src="js/scrambles/init.js" type="module"></script>
<script src="js/scrambles/types.js" type="module"></script>
<script src="js/scrambles/lubes.js" type="module"></script>
<script src="js/ui/code.js" type="module"></script>
<script src="js/ui/2021.js" type="module"></script>
<script src="js/ui/codes/vccode.js" type="module"></script>
<script src="js/ui/codes/blacknwhite.js" type="module"></script>
<script src="js/ui/codes/sccode.js" type="module"></script>
<script src="js/ui/codes/colorful.js" type="module"></script>
<script src="js/ui/codes/bioxmas2020.js" type="module"></script>
<script src="js/ui/init.js" type="module"></script>
<script src="js/ui/colors.js" type="module"></script>
<script src="js/ui/inspection.js" type="module"></script>
<script src="js/ui/dialog.js" type="module"></script>
<script src="js/ui/lang.js" type="module"></script>
<script src="js/ui/logo.js" type="module"></script>
<script src="js/tools/logos.js" type="module"></script>
<script src="js/tools/init.js" type="module"></script>
<script src="js/tools/records/static/wcarecords.js" type="module"></script>
<script src="js/tools/records/init.js" type="module"></script>
<script src="js/tools/records/parser.js" type="module"></script>
<script src="js/tools/image.js" type="module"></script>
<script src="js/voices/index.js" type="module"></script>
<script src="js/voices/events.js" type="module"></script>
<script src="js/voices/people/mv.js" type="module"></script>
<script src="js/voices/people/rc.js" type="module"></script>
<script src="js/voices/people/td.js" type="module"></script>
<script src="js/voices/people/fm.js" type="module"></script>
<script src="js/voices/people/scr.js" type="module"></script>
<script src="js/voices/people/tc.js" type="module"></script>
<script src="js/voices/people/md.js" type="module"></script>
<script src="js/voices/people/lcc.js" type="module"></script>
<script src="js/voices/people/gm.js" type="module"></script>
<script src="js/voices/people/tm.js" type="module"></script>
<script src="js/voices/people/ol.js" type="module"></script>
<script src="js/voices/people/rcb.js" type="module"></script>
<script src="js/voices/people/vc.js" type="module"></script>
<script src="js/voices/people/sc.js" type="module"></script>
<script src="js/voices/people/cs.js" type="module"></script>
<script src="js/voices/people/cc.js" type="module"></script>
<script src="js/voices/people/ab.js" type="module"></script>
<script src="js/voices/init.js" type="module"></script>

     <script src="js/scrambles/pbls.js" type="module"></script>
<script src="js/scrambles/sq2.js" type="module"></script>
<script src="js/scrambles/fto.js" type="module"></script>
<script src="js/scrambles/kilom.js" type="module"></script>
<script src="js/scrambles/guildford.js" type="module"></script>
<script src="js/scrambles/observer.js" type="module"></script>
<script src="js/scrambles/clock.js" type="module"></script>
<script src="js/scrambles/init.js" type="module"></script>
<script src="js/scrambles/types.js" type="module"></script>
<script src="js/scrambles/lubes.js" type="module"></script>
<script src="js/ui/code.js" type="module"></script>
<script src="js/ui/2021.js" type="module"></script>
<script src="js/ui/codes/vccode.js" type="module"></script>
<script src="js/ui/codes/blacknwhite.js" type="module"></script>
<script src="js/ui/codes/sccode.js" type="module"></script>
<script src="js/ui/codes/colorful.js" type="module"></script>
<script src="js/ui/codes/bioxmas2020.js" type="module"></script>
<script src="js/ui/init.js" type="module"></script>
<script src="js/ui/colors.js" type="module"></script>
<script src="js/ui/inspection.js" type="module"></script>
<script src="js/ui/dialog.js" type="module"></script>
<script src="js/ui/lang.js" type="module"></script>
<script src="js/ui/logo.js" type="module"></script>
<script src="js/tools/logos.js" type="module"></script>
<script src="js/tools/init.js" type="module"></script>
<script src="js/tools/records/static/wcarecords.js" type="module"></script>
<script src="js/tools/records/init.js" type="module"></script>
<script src="js/tools/records/parser.js" type="module"></script>
<script src="js/tools/image.js" type="module"></script>
<script src="js/init.js" type="module"></script>
<script src="js/voices/index.js" type="module"></script>
<script src="js/voices/events.js" type="module"></script>
<script src="js/voices/people/mv.js" type="module"></script>
<script src="js/voices/people/rc.js" type="module"></script>
<script src="js/voices/people/td.js" type="module"></script>
<script src="js/voices/people/fm.js" type="module"></script>
<script src="js/voices/people/scr.js" type="module"></script>
<script src="js/voices/people/tc.js" type="module"></script>
<script src="js/voices/people/md.js" type="module"></script>
<script src="js/voices/people/lcc.js" type="module"></script>
<script src="js/voices/people/gm.js" type="module"></script>
<script src="js/voices/people/tm.js" type="module"></script>
<script src="js/voices/people/ol.js" type="module"></script>
<script src="js/voices/people/rcb.js" type="module"></script>
<script src="js/voices/people/vc.js" type="module"></script>
<script src="js/voices/people/sc.js" type="module"></script>
<script src="js/voices/people/cs.js" type="module"></script>
<script src="js/voices/people/cc.js" type="module"></script>
<script src="js/voices/people/ab.js" type="module"></script>
<script src="js/voices/init.js" type="module"></script>

<script src="js/lang/sk-sk-js.js" type="module"></script>
<script src="js/lang/pl-pl-js.js" type="module"></script>
<script src="js/lang/fi-fi-js.js" type="module"></script>
<script src="js/lang/ca-es-js.js" type="module"></script>
<script src="js/lang/nl-nl-js.js" type="module"></script>
<script src="js/lang/sr-sp-js.js" type="module"></script>
<script src="js/lang/tr-tr-js.js" type="module"></script>
<script src="js/lang/pt-pt-js.js" type="module"></script>
<script src="js/lang/el-gr-js.js" type="module"></script>
<script src="js/lang/cs-cz-js.js" type="module"></script>
<script src="js/lang/ko-kr-js.js" type="module"></script>
<script src="js/lang/no-no-js.js" type="module"></script>
<script src="js/lang/it-it-js.js" type="module"></script>
<script src="js/lang/vi-vn-js.js" type="module"></script>
<script src="js/lang/sv-se-js.js" type="module"></script>
<script src="js/lang/zh-tw-js.js" type="module"></script>
<script src="js/lang/da-dk-js.js" type="module"></script>
<script src="js/lang/ja-jp-js.js" type="module"></script>
<script src="js/lang/he-il-js.js" type="module"></script>
<script src="js/lang/uk-ua-js.js" type="module"></script>
<script src="js/lang/ru-ru-js.js" type="module"></script>
<script src="js/lang/es-es-js.js" type="module"></script>
<script src="js/lang/fr-fr-js.js" type="module"></script>
<script src="js/lang/hr-hr-js.js" type="module"></script>
<script src="js/lang/hu-hu-js.js" type="module"></script>
<script src="js/lang/de-de-js.js" type="module"></script>
<script src="js/lang/fa-ir-js.js" type="module"></script>
<script src="js/lang/ro-ro-js.js" type="module"></script>
<script src="js/lang/en-us-js.js" type="module"></script>
<script src="js/lang/zh-cn-js.js" type="module"></script>
     <script src="js/timer+.js" type="module"></script>
</head>
<body>
<div id="leftbar">
  <div class="mybutton c1"><div><span></span><span class="icon">&#59796;</span></div></div>
  <div class="mybutton c2"><div><span></span><span class="icon">&#59846;</span></div></div>
  <div class="mybutton c3"><div><span></span><span class="icon">&#59648;</span></div></div>
  <div id="logo" class="mybutton"><div><span>csTimer</span></div></div>
  <div class="mybutton c4"><div><span></span><span class="icon">&#59835;</span></div></div>
  <div class="mybutton c5"><div><span></span><span class="icon">&#59710;</span></div></div>
  <div class="mybutton c6"><div><span></span><span class="icon">&#59795;</span></div></div>
</div>
<div id="gray"></div>
<div><img id="bgImage"></div>
<div id="about" style="display:none;">
<?php include('lang/'.$lang.'.php') ?>
</div>
<table id="timer" border="0"><tbody>
<tr><td id="container">
<div id="lcd"></div>
<div id="avgstr"></div>
</td></tr>
</tbody></table>
<table border="0" style="position:absolute; right:0%; height:100%;"><tbody>
<tr><td id="multiphase"></td></tr>
</tbody></table>
</body></html>
