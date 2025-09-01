<?php
  ini_alter("session.use_cookies","1");
  session_start();                            

  include('../class/ValidUser.class');
  $valid_user = new ValidUser(session_id(),$form_userid,$form_passwd);

  include_once('../class/Meta.class');
  include_once('../class/TextParse.class');
  include_once('../class/DiaryEntry.class');
  include_once('../class/Trip.class');
  include_once('../class/Log.class');

  $log = new Log (1);
?>
<html>
<?php
  printMeta();
?>

<body>
<table align=center width="100%" border="0">
  <tr>
    <td colspan="2">

<?php
  include ("../utils/title.php");
?>

    </td>
  </tr>
  <tr>
    <td colspan="2">
<?php

   if ( $valid_user->IsValidUser() <= 0 )
   {
     print "<table>";
     print "<tr><td>Login failure - Incorrect username or password.</td></tr>";
     print "<tr><td>&nbsp;</td></tr>";
     print "<tr><td><a href=HomePage.php>Return to the Home Page</a></td></tr>";
     print "</table>";
   } 
   else
   {
     $person = $valid_user->GetUserName();
     print "<table>";

     $diary_num = 0;
     # Get diary_name in order of them having entries. So order of use!
     $de = new DiaryEntry($person, "", "");
     $result = $de->diaries("");
     if (! $result)
       $log->add($PHP_SELF.":- DiaryEntry->diaries","person=($person) - ".mysql_error());
     else
     {
        while ( $row = mysql_fetch_array($result))
        {
          $diary_num++;
        }
     } 

     if ( $diary_num > 0 )
     {
       $redir = "DiarySummary.php?person=$person&" . SID; 
       print "<tr><td><meta http-equiv='refresh' content=\"1;url=$redir\"></td></tr>";
     }
     else
     {        
       print "<tr><td>Hello ".$valid_user->GetForeName().",</td></tr>";
       print "<tr><td>&nbsp;</td></tr>";

       $diary_name_count=0;
       $td = new Trip($person, "");
       $result = $td->check_exists();
       if (! $result)
         $log->add($PHP_SELF.":- Trip->check_exists","person=($person),diary_name=($diary_name) - ".mysql_error());
       else
       {
         while ( $vrow = mysql_fetch_array($result))
         {
           $diary_name_list[$diary_name_count] = $vrow[0];
           $diary_name_count++;
         }
       }

       if ( $diary_name_count <= 0 )
         print "<tr><td>You need to start a new diary, which allows you to enter a name and a description.<br> Once you have done this you can then enter diary entries under this diary name.</td></tr>";
       else
       {
         # Display all diary names registered for this user - none are populated!!
         if ( $diary_name_count == 1 )
           print "<tr><td>The diary <b>".$diary_name_list[($diary_name_count-1)]."</b> has been set up and is ready for you to <a href='EditDiaryEntry.php'>add diary entries</a>.</td></tr>";
         else
         {
           print "<tr><td>The diaries <b>".$diary_name_list[0]."</b>";
           for($i=1; $i<($diary_name_count-1); $i++)
           {
             print ", <b>".$diary_name_list[$i]."</b>";
           }
           print " and <b>".$diary_name_list[$diary_name_count-1]."</b>";
           print " have been set up and are ready for you to <a href='EditDiaryEntry.php'>add diary entries</a>.</td></tr>";
         }
       }



       print "<tr><td>&nbsp;</td></tr>";
       print "<tr><td><a href=HomePage.php>Return to the Home Page</a></td></tr>";
     }
     print "</table>";
   }

?>
    </td>
  </tr>
</table>
</body>
</html>

