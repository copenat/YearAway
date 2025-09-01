<?php
  ini_alter("session.use_cookies","1");
  session_start();                            

  include('../class/ValidUser.class');
  $valid_user = new ValidUser(session_id(),"","");
   
  include_once('../class/DiaryPhotos.class');
  include_once('../class/TextParse.class');
  include_once('../class/Meta.class');
  include_once('../class/UploadFile.class');

  if (!only_alphanumeric($person))
    $person="";
  if (!only_alphanumeric($diary_name))
    $diary_name="";
  if (!valid_date($start_date))
    $start_date="";

  $comment = safeHTML($comment);  

  $dph = new DiaryPhotos($person,$diary_name);
  $uf = new UploadFile( $dph->get_path() );

  function form($person,$diary_name,$start_date,$max_file_size,$comment)
  {
    global $PHP_SELF;

    print "\n<form ENCTYPE=\"multipart/form-data\"  action=\"" . $PHP_SELF . "\" method=\"post\">";
    print "\n<INPUT TYPE=\"hidden\" name=\"MAX_FILE_SIZE\" value=\"" . $max_file_size . "\">";
    print "\n<INPUT TYPE=\"hidden\" name=\"person\" value=\"$person\">";
    print "\n<INPUT TYPE=\"hidden\" name=\"diary_name\" value=\"$diary_name\">";
    print "\n<INPUT TYPE=\"hidden\" name=\"start_date\" value=\"$start_date\">";
    print "\n<INPUT TYPE=\"hidden\" name=\"task\" value=\"upload\">";
    print "\n<br><p></p><p>Upload Photo to $person's $diary_name diary for ".YYYYMMDD_2_displayformat($start_date)." : </p><p></p>";
    print "\n<BR>NOTE: Max file size is " . ($max_file_size / 1024) . "KB";
    print "\n<br><INPUT NAME=\"uploaded_file\" TYPE=\"file\" SIZE=\"50\"><br>";
    print "\n<br>Please add a short comment : <br>";
    print "<INPUT NAME=\"comment\" value=\"$comment\" TYPE=\"text\" SIZE=\"50\"><br>";
    print "\n<br>&nbsp;<br><input type=\"submit\" Value=\"Upload photo\">";
    print "<p></p><p><a href=DiaryEntry.php?person=$person&diary_name=$diary_name&start_date=$start_date>Return to diary entry dated ".YYYYMMDD_2_displayformat($start_date)."</a></p>";
    print "<p></p><p><a href=HomePage.php>Return to the Home Page</a></p>";
    print "\n</form>";
  }

?>

<html>
<?php
  printMeta();
?>

<body>

<table width="100%" align="left" border="0">
  <tr>
     <td colspan="2">

<?php
   include ("../utils/title.php");
?>

     </td>
  </tr>
  <tr>
     <td>

<?php

  if ( $valid_user->IsValidUser() != 0 &&  $valid_user->GetUserName() == $person )
  {
    switch($task) {
        case 'upload':
                $dph->create_photo_dir();
                $new_filename = $dph->gen_filename($start_date,$uf->get_file_extension($uploaded_file_type));
                $error = $uf->upload($uploaded_file,$new_filename,$uploaded_file_size,$uploaded_file_type);
                if ( $error )
                   print "&nbsp;<br><span class=error_msg>$error</span>";
                else
                {
                   print "<p>Upload successful.</p>";
                   if ($dph->add_entry($start_date,$comment,$uf->get_file_extension($uploaded_file_type)) )
                   {
                     print "<p>Successfully added to diary dated ".YYYYMMDD_2_displayformat($start_date)."</p>";
                     $comment="";
                   }
                   else
                   {
                     print "<p>Problems adding photo ($new_filename) to diary dated ".YYYYMMDD_2_displayformat($start_date)."</p>";
                     print "<p>An internal error has prevented the addition of this photo to the diary entry. Please report this error to support@yearaway.com with photo attached. We will fix this problem and add the photo for you.</p><p>Sorry for the inconvience.</p>";
                   }

                }

                print "<p></p><p><a class=visited_country_link href=\"AddPhoto.php?person=$person&diary_name=$diary_name&start_date=$start_date&comment=$comment\">Return to Upload Photo</a></p>";
                print "<p></p><p><a href=DiaryEntry.php?person=$person&diary_name=$diary_name&start_date=$start_date>Return to diary entry dated ".YYYYMMDD_2_displayformat($start_date)."</a></p>";
                print "<p></p><p><a href=HomePage.php>Return to the Home Page</a></p>";

        break;
        default:
                form($person,$diary_name,$start_date,$uf->get_max_file_size(),$comment);
      }

    }
    else
    {

      print "<p>You have not logged on - you must do so before you " .
            "can add a photo.</p><p>If you are not a registered user, " .
            "<a href=NewUser.php>please register yourself</a></p>";

      print "<p><a href=HomePage.php>Return to the Home Page</a></p>";
    }

?>
    </td>
  </tr>
</table>

</body>
</html>





