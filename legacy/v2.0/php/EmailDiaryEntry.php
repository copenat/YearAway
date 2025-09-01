<?php   
   ini_alter("session.use_cookies","1");
   session_start();

   include('../class/ValidUser.class');
   $valid_user = new ValidUser(session_id(),"","");
   include_once('../class/TextParse.class');
   include_once('../class/YearAway.class');

   if (!only_alphanumeric($person))
     $person="";
   if (!only_alphanumeric($diary_name))
     $diary_name="";
   if (!valid_date($start_date))
     $start_date="";

   include_once('../class/SubscribeEmail.class');
   $se = new SubscribeEmail($person, "");

   include_once('../class/DiaryEntry.class');
   $de = new DiaryEntry($person,$diary_name,"");

   include_once('../class/Log.class');
   $log = new Log (1);
   include_once('../class/Meta.class');
?>
<html>
<?php
   printMeta();
?>

<body>
<form name=delete_emails action="EmailDiaryEntry.php" method=POST>
<table align="left" border=0 width=100%>
  <tr> 
    <td colspan=2>
<?php
  include "../utils/title.php";
?>
     </td>
  </tr>

  <tr>
    <td valign=top colspan=2>
<?

   # Lets do the delete
   if ( $valid_user->IsValidUser() > 0 && $valid_user->GetUserName() == $person && 
        $person!="" && $diary_name!="" && $start_date!="" )
   {
      # So user is logged in and owns this diary entry. Three vars are all set

      $result = $se->get_emails(0,"  order by email ");
      $count=0;
      $emailsent=0;
      if ( $result )
      {
        while ( $row = mysql_fetch_array($result))
        {
           $row[var_email]=valid_var($row[email]);
           $count++;
           $var = "$row[var_email]$count";
           if ( isset($sendall) )
           {
             if ( yearaway_email($row[email],$person,$diary_name,$start_date,"SEND") >= 0 )
               $emailsent++;
           }
           elseif ( $$var == "yes"  )
           {
              if ( isset($send) )
              {
                 if ( yearaway_email($row[email],$person,$diary_name,$start_date,"SEND") >= 0 )
		 {
                   $emailsent++; 
		 }
              }
              elseif ( isset($delete) )
              {
                 $se->delete_emails($row[email]);
              }
           }
        } 
      }
      if ( $emailsent >= 0 )
      {
         $de->change_emailsent($start_date,$emailsent); 
         print "<p>$emailsent email(s) have been despatched for the diary entry dated ".YYYYMMDD_2_displayformat($start_date)."</p><br>";
      }
?>
    </td>
  </tr>
<tr> 
    <td align=left valign="top"> 
       <table border=0 align="left" valign="top">
<?php
      print "<tr><td colspan=3 align=left>Email subscribers to diaries by $person</td></tr>";
      print "<tr><td colspan=3>&nbsp;</td></tr>";

      $result = $se->get_emails (0, " order by email ");

      if (! $result)
      {
        $log->add($PHP_SELF.":- SubscribeEmail->get_emails","person=($person),diary_name=($diary_name) - ".mysql_error());
        print "</table>";
      }
      else
      {
        print "<tr><td>Email Address</td><td>Date entered</td><td>&nbsp</td></tr>";
        $count = 0;
        while ( $row = mysql_fetch_array($result))
        {
          $row[var_email]=valid_var($row[email]);
          $count++;
          print "<tr><td>$row[email]</td><td>$row[date_added]</td>";
          print "<td align=right><input name=\"$row[var_email]$count\" value=\"yes\" type=CHECKBOX><br></td></tr>";
        }
        print "</table>\n";

        print "</td><td align=left valign=top>";

        print "<input type=hidden name=person value=$person>";
        print "<input type=hidden name=diary_name value=$diary_name>";
        print "<input type=hidden name=start_date value=$start_date>";

        print "<table>";
        if ( $count > 0 )
        {
          print "<tr><td><input onclick='return window.confirm(\"Do you really wish to send notification emails to ALL recipients?\")' type=submit name=sendall value=\"Send email to ALL addresses     \"></td></tr>";
          print "<tr><td><input onclick='return window.confirm(\"Confirm to send notification emails the selected recipients?\")' type=submit name=send    value=\"Send email to selected addresses\"></td></tr>";
          print "<tr></tr>";
          print "<tr><td><input onclick='return window.confirm(\"Do you really wish to delete the selected email addresses?\")' type=submit name=delete  value=\"Delete selected email addresses \"></td></tr>";
          print "<tr></tr>";
          print "<tr></tr>";
          print "<tr><td><input type=reset               value=\"Press to Reset Fields           \"></td></tr>"; 
        }
        print "<tr><td>&nbsp;</td></tr>";
        print "<tr><td>&nbsp;</td></tr>";
 
        if ( $start_date != "" )
        {
           print "<tr><td><a href=DisplayEmail.php?person=$person&diary_name=$diary_name&start_date=$start_date>View email to be sent</a></td></tr>";
           print "<tr><td>&nbsp;</td></tr>";
           print "<tr><td><a href=DiaryEntry.php?person=$person&diary_name=$diary_name&start_date=$start_date>Return to diary entry dated ".YYYYMMDD_2_displayformat($start_date)."</a></td></tr>";
        }
        print "<tr><td><a href=HomePage.php>Return to the Home Page</a></td></tr>";
        print "</table>";

        print "</td></tr>";
      }
   }

?>
</table>
</form>
</body>
</html>
