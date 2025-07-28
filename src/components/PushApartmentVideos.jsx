import axios from 'axios';
import React, { useContext, useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import {  AddApartmentVideoAPI } from "../Endpoints";
import GlobalContext from '../Context';
import useNotifier from '../hooks/useNotifier';

const thumbsContainer = {
  display: 'flex',
  flexDirection: 'row',
  flexWrap: 'wrap',
  marginTop: 16
};

const thumb = {
  display: 'inline-flex',
  borderRadius: 2,
  border: '1px solid #eaeaea',
  marginBottom: 8,
  marginRight: 8,
  width: 100,
  height: 100,
  padding: 4,
  boxSizing: 'border-box'
};

const thumbInner = {
  display: 'flex',
  minWidth: 0,
  overflow: 'hidden'
};

const vid = {
  display: 'block',
  width: 'auto',
  height: '100%'
};


export default function PushApartmentVideos(props) {
	const [files, setFiles] = useState([]);

	const { token } = useContext(GlobalContext);
	const notify = useNotifier();

	const uploadFile = (file) => {
		try {
			const formData = new FormData();
			formData.append('file', file);

			const config = {
			  headers: {
				'Authorization': `Bearer ${token}`,
				'content-type': 'multipart/form-data',
			  },
			};

			axios.post(AddApartmentVideoAPI+props.apartmentId, formData, config).then((_res) => {
				notify('', 'Uploaded', 'success');
			}).catch((_err) => {
				notify("Failed", _err?.message || "Try again", "error");
			});
		} catch (error) {
			console.error(error)
		}
	}

	const {getRootProps, getInputProps} = useDropzone({
		accept: { 'video/*': [] },
		onDrop: acceptedFiles => {
			uploadFile(acceptedFiles[0]);

			// setFiles(acceptedFiles.forEach(file => {
			// 	Object.assign(file, {
			// 		preview: URL.createObjectURL(file)
			// 	})
			// }));
		}
  	});


	const thumbs = files.map(file => (
		<div style={thumb} key={file?.name}>
			<div style={thumbInner}>
				<video
					src={file?.preview}
					style={vid}
					// Revoke data uri after video is loaded
					onLoad={() => { URL.revokeObjectURL(file?.preview) }}
				/>
			</div>
		</div>
	));

	useEffect(() => {
		// Make sure to revoke the data uris to avoid memory leaks, will run on unmount
		return () => files.forEach(file => URL.revokeObjectURL(file?.preview));
	}, [files]);

	return (
		<section className="container" style={{ width: '100%' }}>
			<div {...getRootProps({className: 'dropzone'})}>
				<input {...getInputProps()} multiple="false" />
				<p>Drag 'n' drop a video here, or click to select a video</p>
			</div>
			<aside style={thumbsContainer}>
				{thumbs}
			</aside>
		</section>
	);
}


