#!/usr/bin/env python3
"""
Quick start script for the Sign Language Detection Backend
"""

import os
import sys
import subprocess

def check_model():
    """Check if the model file exists"""
    model_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'cnn8grps_rad1_model.h5')
    if not os.path.exists(model_path):
        print(f"❌ Model file not found at: {model_path}")
        print("Please ensure the model file is in the parent directory")
        return False
    print(f"✅ Model found at: {model_path}")
    return True

def check_python_version():
    """Check if Python version is compatible"""
    if sys.version_info < (3, 8):
        print("❌ Python 3.8 or higher is required")
        return False
    print(f"✅ Python {sys.version_info.major}.{sys.version_info.minor} detected")
    return True

def install_dependencies():
    """Install required dependencies"""
    print("📦 Installing dependencies...")
    try:
        subprocess.check_call([sys.executable, '-m', 'pip', 'install', '-r', 'requirements.txt'])
        print("✅ Dependencies installed successfully")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to install dependencies: {e}")
        return False

def start_server():
    """Start the Flask server"""
    print("🚀 Starting Sign Language Detection Server...")
    try:
        subprocess.check_call([sys.executable, 'server.py'])
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to start server: {e}")
        return False
    except KeyboardInterrupt:
        print("\n👋 Server stopped by user")
        return True

def main():
    """Main setup and start process"""
    print("=" * 60)
    print("🤟 Sign Language Detection Backend Setup")
    print("=" * 60)
    
    # Check requirements
    if not check_python_version():
        sys.exit(1)
    
    if not check_model():
        sys.exit(1)
    
    # Ask if user wants to install dependencies
    install_deps = input("\nDo you want to install/update dependencies? (y/n): ").lower().strip()
    if install_deps in ['y', 'yes']:
        if not install_dependencies():
            print("⚠️  Continuing with existing dependencies...")
    
    # Start the server
    print("\n" + "=" * 60)
    start_server()

if __name__ == "__main__":
    main()
