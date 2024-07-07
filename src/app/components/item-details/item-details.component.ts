import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-item-details',
  templateUrl: './item-details.component.html',
  styleUrls: ['./item-details.component.css'],
})
export class ItemDetailsComponent implements OnInit {
  item: any; // משתנה לשמירת פרטי הפריט

  constructor(private route: ActivatedRoute, private apiService: ApiService) {}

  ngOnInit(): void {
    // קבלת המזהה של הפריט מהנתיב
    const id = this.route.snapshot.paramMap.get('id');
    // קריאת הנתונים מהשרת
    this.apiService.getData().subscribe(
      (response) => {
        // מציאת הפריט המתאים לפי המזהה
        this.item = response.find((item: any) => item.id === id);
        if (this.item) {
          this.formatDate(); // עיצוב תאריך במקרה שהפריט נמצא
        }
      },
      (error) => {
        console.error('Error fetching item details:', error);
      }
    );
  }

  formatDate(): void {
    if (this.item) {
      // עיצוב תאריך לתצוגה יום/חודש/שנה
      const year = this.item.Year.substring(0, 4);
      const month = this.item.Year.substring(4, 6);
      const day = this.item.Year.substring(6, 8);
      this.item.Year = `${day}/${month}/${year}`;
    } else {
      console.error('Data is not defined or not an array');
    }
  }
}
