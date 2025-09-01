<?php
   ini_alter("session.use_cookies","1");
   session_start();

   include('../class/ValidUser.class');
   $valid_user = new ValidUser(session_id(),"","");

   include_once('../class/Meta.class');
?>
<html>
<?php
   printMeta();
?>

<body>
<table valign="top" align="left" border="0" width=100%>
  <tr> 
    <td colspan="2">
<?php
   include ("../utils/title.php");
?>
     </td>
  </tr>


  <tr> 
    <td colspan=2 valign="top">

<p>What is YearAway all about?</p>

<p>In 2001 we got married and embarked upon a very long honeymoon - our YearAway.  Before we went we wanted to find the best way of keeping in touch with friends and family back home, but wanted to avoid sending round-robin e-mails.  Thus, YearAway.com was born!  What better way of keeping those folk at home informed of our adventures than a web-site full of our diary entries which notified everyone who was interested every time we submitted a new diary?</p>

<p>When we got home people went on about what a good idea it had been and how much they'd enjoyed reading about our trip.  One friend even said that it enabled her to travel places that she'd never get to.</p>

<p>Other people said they'd love to do the same, even for shorter trips, but that they didn't know how to build a site and probably couldn't be bothered if they did!</p>

<p>So, we decided to broaden its use.  Now, anyone can use it to tell friends and family about their travels, they can put photos on it and everyone who subscribes to a diary will be informed as soon as a new entry is submitted.</p>

<p>We think it's a good idea!  It worked well for us and we hope that others will think the same and use YearAway.com</p>

<p>And, of course, it's free - so give it go!  What can you loose?</p>

<br>
<p><a href=HomePage.php>Return to the Home Page</a></p>
</td>
  </tr>
</table>
</body>
</html>
