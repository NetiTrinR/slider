<?php
	function getImages($dir){
		if(realpath($dir)){
			$dh = new DirectoryIterator($dir);
		}else{
			return array('errorMsg'=>'Entered Directory not a real path '.$dir);
		}
		$array = array();
		foreach ($dh as $fileInfo){
			if($fileInfo->isFile()&&isImage($fileInfo->getFilename()))//if it is a file and has a image extention
				$array[] = $dir.$fileInfo->getFilename();
		}
		
		sort($array);
		return $array;
	}

	function getExt($dir){
		return pathinfo($dir, PATHINFO_EXTENSION);
	}

	function isImage($dir){
		$ext = getExt($dir);
		switch (strtolower($ext)) {
			case 'bmp':
			case 'gif':
			case 'jpg':
			case 'png':
				return true;
			break;
		}
		return false;
	}

	if(isset($_POST['action']))
	{
		// sanitize($_POST);
		switch($_POST['action']){
			case 'getImagesFromDir':
				echo json_encode(getImages($_POST['path']));
				break;
		}
	}
?>
