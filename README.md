# Fertility Service and Cryobank Management System - Mobile App / Ứng dụng di động quản lý dịch vụ hiếm muộn

A comprehensive fertility clinic and cryobank management system designed to streamline patient care, sample tracking, and clinical workflows.

Hệ thống quản lý phòng khám hiếm muộn và ngân hàng trữ đông toàn diện, được thiết kế để tối ưu hóa việc chăm sóc bệnh nhân, theo dõi mẫu vật và quy trình lâm sàng.

This mobile version is designed specifically for patient use.  
Phiên bản di động này được thiết kế đặc biệt cho bệnh nhân sử dụng.

**Other Project Components / Các thành phần khác của dự án:**

- **Web App (Staff):** <https://github.com/devnguyen0111/cryoweb>
- **Backend:** <https://github.com/khiemvuong2310/ITCS-Backend>

## Missing Features in Web Preview / Tính năng thiếu trong bản Web

The web preview attached in the GitHub page is for demo purposes only. Some capabilities or features may be missing. For the best experience, please use our mobile version.

Bản xem trước trên GitHub chỉ phục vụ mục đích demo. Một số chức năng có thể chưa đầy đủ. Để trải nghiệm tốt nhất, vui lòng sử dụng ứng dụng di động.

Possible missing features:

- Payment (VNPAY)
- View images (PDF is supported)
- Download media (images and PDF)

## Development Setup / Cài đặt môi trường phát triển

### Prerequisites / Yêu cầu trước khi cài đặt

1. Install Android Studio and create a virtual device (note down the device name).  
   Cài đặt Android Studio và tạo thiết bị ảo (ghi nhớ tên thiết bị).

2. Add Android SDK emulator path to system PATH:  
   Thêm đường dẫn đến thư mục emulator của Android SDK vào biến môi trường "Path":

   ```text
   [Your Android SDK path]/emulator
   ```

### Running the Project / Chạy dự án

1. Start the Android emulator without Android Studio:  
   Khởi động thiết bị ảo Android mà không cần mở Android Studio:

   ```bash
   emulator -avd [your-device-name]
   ```

2. Run the app on the virtual device:  
   Chạy ứng dụng trên thiết bị ảo:

   ```bash
   ionic cap run android
   ```

   A list of available devices will be shown. Note down your device ID for faster deployment next time:  
   Danh sách các thiết bị khả dụng sẽ hiển thị. Ghi nhớ device ID để lần sau chạy tiện hơn:

   ```bash
   ionic cap run android --target=[device-id]
   ```

### For development with hot reload / Để phát triển với hot reload

   ```bash
   ionic cap run android --target=[device-id] --livereload --external
   ```

#### Optional: NPM Scripts / Tùy chọn: Các lệnh NPM

For convenience, you can add these commands to your `package.json` (replace [device-id] with your actual device ID):  
Để thuận tiện, bạn có thể thêm các lệnh sau vào `package.json` (thay [device-id] bằng ID thiết bị của bạn):

```json
{
  "scripts": {
    "android": "ionic cap run android",
    "android:dev": "ionic cap run android --target=[device-id] --livereload --external"
  }
}
```

## Web Preview Notice

The web preview attached in the GitHub page is for demo purposes only. Some capabilities or features may be missing. For the best experience, please use our mobile version.

- Payment (VNPAY)
- View images (PDF is supported)
- Download media (images and PDF)
