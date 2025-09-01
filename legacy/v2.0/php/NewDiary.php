<?php
  ini_alter("session.use_cookies","1");
  session_start();                            

  include('../class/ValidUser.class');
  $valid_user = new ValidUser(session_id(),"","");

  include ('../class/DiaryEntry.class');
  include ('../class/Trip.class');

  if (!only_alphanumeric($person))
    $person="";
  if (!only_alphanumeric($diary_name))
    $diary_name="";
  if (!valid_date($start_date))
    $start_date="";

  $trip = new Trip($person,$diary_name);

  include_once('../class/Meta.class'); 
?>

<html>
<?php
  printMeta();
?>

<body>

<table width="100%" border="0">
  <tr>
     <td colspan="2">

<?php
   include ("../utils/title.php");
?>

     </td>
  </tr>
</table>

<br>

  <?php
    if ($valid_user->IsValidUser() <= 0)
    {
      print "<p>You have not logged on - you must do so before you " .
            "create a new diary.</p><p>If you are not a registered user, " .
            "<a href=NewUser.php>please register yourself</a></p>";

      print "<p><a href=HomePage.php>Return to the Home Page</a></p>";

    }
    else
    {
      print "<form action=\"SubmitNewDiary.php?" . SID . "\" method=post>";

      if ( $diary_name != "" )
      {
        $result = $trip->get_trip_mesg(); 

        if ( $result )
        {
          $row = mysql_fetch_array($result);
          if ($diary_details == "" )
            $diary_details = $row[description];
        }
      }
?>

<table align=center border=0>
<tr>
  <td align=left>Name</td> 
  <td align=left> 
<?php
      print $valid_user->GetUserName();
      print "<td> <input type=hidden name=person value=$person> <input type=hidden name=start_date value=$start_date></td>";
?>
  </td> 
</tr>

<tr>
  <td align=left>Diary Name</td>
<?php
      if ( $diary_name != "" )
        print "<td align=left> $diary_name <input type=hidden name=diary_name value=$diary_name> </td>";
      else
        print "<td align=left class=small><input type=text framewidth=4 name=diary_name size=20> (Note: alphanumeric only)</td>";
?>
</tr>

<tr>
  <td align=left colspan=2>Description of diary</td>
</tr>
 <tr>
<?php
      print "<td colspan=2> <textarea name=\"diary_details\" cols=60 rows=8 wrap=soft>$diary_details</textarea> </td>"
?>
</tr>
</table>

<table align=center>
<tr><td align=center>
<input type="submit" value="Submit Changes">&nbsp;&nbsp;<input type="reset">
</td>
</tr>
</table>
</form>
<?php
    }
?>
</body>
</html>

