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

  if ( $special != "" )
  {
    $dph->set_special_feature_photo($fn);
    print "Updated $person $diary_name $start_date $fn to be the special feature."; 
  } 

  $type = $dph->get_type($start_date,$fn);
  $full_filename = $dph->get_full_filename($fn, $type);

  if ( $person != "" && $diary_name != "" && $start_date != "" && $type != "" && $fn != "" && is_file($full_filename) )
  {
    $get_vars = "person=$person&diary_name=$diary_name&start_date=$start_date";

    $new_sizes = $dph->resize_photo("large", $full_filename);
    list($w,$h) = explode(" ", $new_sizes);

    print "<table width=650 align=left border=0> ";
    print " <tr><td colspan=2 align=center>";

    # Add a number for each photo - also get the next photo in the order from here
    $count = 1;
    $next_row_is_next_photo = 0;
    $result = $dph->get_photo($start_date,0);
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

    #$im_size = GetImageSize($full_filename);
    #list($foo,$width,$bar,$height) = explode("\"",$im_size[3]);
    #print " </td><td NOWRAP>OLD height=$height width=$width ".($height / $width)."<BR> NEW height=$h width=$w</td></tr>";

    print " </td></tr>";

    print "<tr><td><img width=$w height=$h src=\"$full_filename\" border=1 ></td>";

    print "<td valign=top width=200>";

    print " <table width=100%><tr><td valign=top>";
    $result = $dph->get_photo($start_date,$fn);
    if ($result)
    {
      while ( $row = mysql_fetch_array($result))
      {
        print http2ahref(nl2br($row[comment]));
      }
    }
    
    if ($valid_user->IsValidUser() != 0 && $valid_user->GetUserName() == "sue_and_nathan")
    {
        print "<form action=\"Photo.php\" method=post>";
        print "<table><tr><td>";
        print "<input type=hidden name=person value=$person>";
        print "<input type=hidden name=diary_name value=$diary_name>";
        print "<input type=hidden name=start_date value=$start_date>";
        print "<input type=hidden name=fn value=$fn>";
        print "<input name=special type=submit value=\"Set picture to be Special Feature.\">";
        print "</td></tr></table>";
        print "</form>";
    }

    print "</td>";
    print "</tr></table>";
    
    print "</td></tr>";


    print "<tr>";
    $href="DiaryEntry.php?$get_vars";

    $result = $de->get_entries ("","", "", $start_date,"", 1, "desc");
    if ($result)
    {
      if ( $row = mysql_fetch_array($result))
      {
        print "<td><a class=diary_location href=\"$href\">".YYYYMMDD_2_displayformat($start_date)." : $row[location] - $row[country]</a></td>";
        print "<td valign=top class=small>";
        print "<form action=\"Photo.php\" method=post>";
        print "<table><tr><td>";
        print "<input type=hidden name=person value=$person>";
        print "<input type=hidden name=diary_name value=$diary_name>";
        print "<input type=hidden name=start_date value=$start_date>";
        print "<input type=hidden name=fn value=$fn>";
        print "<input name=slideshow type=submit value=\"See photos as slideshow.\">";
        print "</td></tr></table>";
        print "</form>";

        print "</td></tr>";

        print "<tr><td><span class=diary_title>$row[section]</span></td><td>&nbsp;</td></tr>";
        print "<tr><td colspan=2 class=diary_text_small>" .  do_more($row[message],$href) . "</td>";

      }
    }
    else
    {
      print "<td>&nbsp;</td>";
      print "<td valign=top class=small>";
      print "<form action=\"Photo.php\" method=post>";
      print "<table><tr><td>";
      print "<input type=hidden name=person value=$person>";
      print "<input type=hidden name=diary_name value=$diary_name>";
      print "<input type=hidden name=start_date value=$start_date>";
      print "<input type=hidden name=fn value=$fn>";
      print "<input name=slideshow type=submit value=\"See photos as slideshow.\">";
      print "</td></tr></table>";
      print "</form>";
      print "</td>";
    }

    print "</tr>";
    print "</table>";
   

    if ( $slideshow != "" && $next_photo != 0 )
    {
       $redir = "Photo.php?$get_vars&fn=$next_photo&slideshow=1";
       print "<meta http-equiv='refresh' content=\"5;url=$redir\">";
    }
  }
?>

</body>
</html>

