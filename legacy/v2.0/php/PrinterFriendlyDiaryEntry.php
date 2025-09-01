<?php
   ini_alter("session.use_cookies","1");
   session_start();

   include('../class/ValidUser.class');
   $valid_user = new ValidUser(session_id(),"","");

   include_once('../class/DiaryEntry.class');
   $de = new DiaryEntry($person,$diary_name,"");

   include_once('../class/Meta.class');
   include_once('../class/Log.class');
   $log = new Log (1);
?>
<html>
<?php
   printerfriendly_printMeta();
?>

<body>
<table align="left" border="0" width=100%>
  <tr> 
    <td colspan="2">
    <table>
    <tr>
      <td width="213">
         <a href="HomePage.php">
            <img src="../graphics/yearaway.gif" width="213" height="100" border="0" alt="YearAway.com"></a>
      </td>
      <td align="center">
        <table width="100%" border="0">
          <tr>
            <td colspan="3"><b>This is our YearAway.com </b>
            </td>
          </tr>
          <tr>
            <td>&nbsp;</td>
            <td>&nbsp;</td>
            <td>&nbsp;</td>
          </tr
          <tr>
          </tr>
        </table>
      </td>
    </tr>
    </table>
    </td>
  </tr>


  <tr> 
    <td align=center valign="top"> 
       <table border="0" align="left" valign="top">
<?php
    $result = $de->get_entries ("","", "", $start_date,"", 1, "desc");

    if (! $result)
        $log->add($PHP_SELF.":- DiaryEntry->get_entries","start_date=($start_date),person=($person),diary_name=($diary_name) - ".mysql_error());
    else
    {
        while ( $row = mysql_fetch_array($result))
        {
            print "<tr><td align=left>";
            print "<b>Author : $row[user_name]</b></td>";
            print "<td><b>Diary name : $row[diary_name]</b></td>";

            print "<td colspan=2>&nbsp</td></tr>";

            print "<tr><td colspan=2 align=left>";
            print "<b>$row[start_date_disp] : $row[location] - $row[country]</b></td>";
            print "<td colspan=2>&nbsp</td></tr>";

            print "<tr><td colspan=4>&nbsp;</td></tr>";
            print "<tr><td colspan=4><b>$row[section]</b></td></tr>";

            print "<tr><td colspan=4>";

            print nl2br($row[message]) . "</td></tr>";

            $count++;
        }

    }

?>
   
       
       </table>

     </td>
  </tr>
</table>
</body>
</html>
