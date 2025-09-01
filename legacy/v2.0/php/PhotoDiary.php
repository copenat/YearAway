<?php
  ini_alter("session.use_cookies","1");
  session_start();                            

  include('../class/ValidUser.class');
  $valid_user = new ValidUser(session_id(),"","");

  include_once('../class/DiaryEntry.class');
  include_once('../class/DiaryPhotos.class');
  include_once('../class/TextParse.class');
  include_once('../class/Meta.class'); 

  if (!only_alphanumeric($person))
    $person="";
  if (!only_alphanumeric($diary_name))
    $diary_name="";
  if (!valid_date($start_date))
    $start_date="";
  if(!only_numeric($fn))
    $filename="";

  $de = new DiaryEntry($person,$diary_name,"");
  $dph = new DiaryPhotos($person,$diary_name);

?>

<html>
<?php
  printMeta();
?>

<body>
<?php

    print "<table width=650 align=left border=0> ";
    print " <tr><td align=center>";

    # Add a number for each photo - also get the next photo in the order from here
    $count = 1;
    $next_row_is_next_photo = 0;
    $result = $dph->get_photo(0,0);
    if ($result)
    {
      while ( $row = mysql_fetch_array($result))
      {
        $href = "Photo.php?$get_vars&fn=".$row[filename];
        if ( $next_row_is_next_photo )
        {
          $next_row_is_next_photo = 0;
          $next_photo = $row[filename];
        }

        if ( $fn == $row[filename] )
        {
          print "<a class=photo_num_curr href=\"$href\">$count</a> ";
          $next_row_is_next_photo = 1;
        }
        else
          print "<a class=photo_num href=\"$href\">$count</a> ";

        $count++;
      }
    }
    print " </td><td>&nbsp;</td></tr>";


    print "<tr><td width=450><img width=$w height=$h src=\"$full_filename\" border=0 ></td>";

    print "<td valign=top width=200>";

    print " <table width=100%><tr><td valign=top>";
    $result = $dph->get_photo($start_date,$fn);
    if ($result)
    {
      while ( $row = mysql_fetch_array($result))
      {
        print "".$row[comment]."";
      }
    }
    print "</td></tr>";
    print "</table>";

    print "</td></tr>";


?>

</body>
</html>

