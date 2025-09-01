<?php
    ini_alter("session.use_cookies","1");
    session_start();                            

    include('../class/ValidUser.class');
    $valid_user = new ValidUser(session_id(),"","");

    include_once("../class/SubscribeEmail.class");
    include_once("../class/TextParse.class");
    include_once('../class/Meta.class');

   if (!only_alphanumeric($person))
     $person="";
   if (!only_alphanumeric($diary_name))
     $diary_name="";
   if (!valid_date($start_date))
     $start_date="";
?>
<html>
<?php
   printMeta();
?>


<body>
<table align="left" border="0" width=100%>
  <tr>
    <td colspan="2">
<?php
  include "../utils/title.php";
?>
    </td>
  </tr>

  <tr>
    <td>
<?php

    if ( (isset($subscribe_email)) && ($person != "") && ($diary_name != "") && ($start_date!="") )
    {
        print "Email Notification Request";

        $subscribe_email = ltrim(rtrim($subscribe_email));
        if (! check_email($subscribe_email))
          print "<p>$subscribe_email is an invalid email address - Re-enter your correct email address";
        else
        {
          $se = new SubscribeEmail( $person, $diary_name );
          $ret = $se->add_email( $subscribe_email ); 

          print "<p>You have subscribed to receive notifications of updates to $person's diaries.\n";
          print "<p>Emails will be sent to $subscribe_email.\n";

          print "<p>If you wish to cancel your email subscription, please send an email to support@yearaway.com";
        }

        print "<p><a href=\"DiaryEntry.php?person=$person&diary_name=$diary_name&start_date=$start_date\">Return to diary dated ".YYYYMMDD_2_displayformat($start_date)."</a>\n";
    }

?>

</td></tr>
</table>

</html>
