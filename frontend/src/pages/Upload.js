import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './Upload.css';

export default function Upload() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Other');
  const [image, setImage] = useState(null);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const navigate = useNavigate();

  const validateForm = () => {
    if (!title.trim()) {
      setError('Game title is required');
      return false;
    }
    if (!image) {
      setError('Game image is required');
      return false;
    }
    if (!file) {
      setError('Game file is required');
      return false;
    }
    
    // Validate file sizes (10MB for image, 1GB for game file)
    const maxImageSize = 10 * 1024 * 1024; // 10MB
    const maxFileSize = 1024 * 1024 * 1024; // 1GB
    
    if (image.size > maxImageSize) {
      setError('Image file size must be less than 10MB');
      return false;
    }
    
    if (file.size > maxFileSize) {
      setError('Game file size must be less than 1GB');
      return false;
    }
    
    return true;
  };

  const handleImageChange = (e) => {
    const selectedImage = e.target.files[0];
    if (selectedImage) {
      setImage(selectedImage);
      setError('');
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(selectedImage);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('description', description.trim());
      formData.append('category', category);
      formData.append('image', image);
      formData.append('file', file);

      const response = await api.post('/games', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          console.log('Upload progress:', percentCompleted);
        },
      });
      
      // Check if upload was successful
      if (response.data.success) {
    navigate('/');
      } else {
        setError(response.data.error || 'Upload failed');
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.response?.data?.error || 'Upload failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>Upload Game</h1>
      {error && <div className="error">{error}</div>}
      
      <form onSubmit={handleSubmit} className="upload-form">
        <div className="form-group">
          <label htmlFor="title">Game Title *</label>
        <input
            id="title"
          type="text"
            placeholder="Enter game title"
          value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              setError('');
            }}
            disabled={loading}
          required
        />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            placeholder="Enter game description (optional)"
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              setError('');
            }}
            disabled={loading}
            rows="3"
          />
          <small>Maximum 500 characters</small>
        </div>

        <div className="form-group">
          <label htmlFor="category">Category</label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            disabled={loading}
          >
            <option value="Other">Other</option>
            <option value="Action">Action</option>
            <option value="Adventure">Adventure</option>
            <option value="RPG">RPG</option>
            <option value="Strategy">Strategy</option>
            <option value="Sports">Sports</option>
            <option value="Racing">Racing</option>
            <option value="Puzzle">Puzzle</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="image">Game Image *</label>
        <input
            id="image"
          type="file"
          accept="image/*"
            onChange={handleImageChange}
            disabled={loading}
          required
        />
          {imagePreview && (
            <div className="image-preview">
              <img src={imagePreview} alt="Preview" />
            </div>
          )}
          <small>Maximum size: 10MB</small>
        </div>

        <div className="form-group">
          <label htmlFor="file">Game File *</label>
        <input
            id="file"
          type="file"
            onChange={handleFileChange}
            disabled={loading}
          required
        />
          <small>Maximum size: 1GB</small>
        </div>

        <button 
          type="submit" 
          className="btn-upload"
          disabled={loading}
        >
          {loading ? 'Uploading...' : 'Upload Game'}
        </button>
      </form>
    </div>
  );
}
