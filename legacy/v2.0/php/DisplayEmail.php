<?php
   ini_alter("session.use_cookies","1");
   session_start();

   include('../class/ValidUser.class');
   $valid_user = new ValidUser(session_id(),"","");

   include_once('../class/YearAway.class');
   include_once('../class/Log.class');

   if (!only_alphanumeric($person))
     $person="";
   if (!only_alphanumeric($diary_name))
     $diary_name="";
   if (!valid_date($start_date))
     $start_date="";

   $log = new Log(1);

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

     <br><br>
<?php

   
   if ( $valid_user->IsValidUser() != 0 &&  $valid_user->GetUserName() == $person &&
        $person != "" && $diary_name != "" && $start_date != "" )
   {
      print "<hr>";  
      print nl2br(yearaway_email("",$person,$diary_name,$start_date,"NOSEND"));
      print "<hr>";  

      print "<a href=EmailDiaryEntry.php?person=$person&diary_name=$diary_name&start_date=$start_date>Return to send notification emails.</a><br>";
   }
   print "<a href=HomePage.php>Return to the Home Page</a>";

?>

    </td>
  </tr>
</table>
</body>
</html>
