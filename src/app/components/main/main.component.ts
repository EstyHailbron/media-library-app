import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { Router } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css'],
})
export class MainComponent implements OnInit {
  data: any[] = []; // משתנה לשמירת כל הנתונים
  errorMessage: string = ''; // הודעת שגיאה
  filteredData: any[] = []; // נתונים מסוננים להצגה
  searchTerm: string = ''; // מונח חיפוש
  view: 'list' | 'grid' = 'list'; // מצב תצוגה (רשימה או רשת)
  sortDirection: 'asc' | 'desc' = 'asc'; // כיוון מיון (עולה או יורד)
  editing: boolean = false; // מצב עריכה
  originalTitle: string = ''; // שם מקורי של הפריט לעריכה

  // נתונים מפוצלים
  splittedData: any = {};
  tabNames: string[] = [];
  selectedTab: string = '';

  constructor(
    private apiService: ApiService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.fetchData(); // קריאת הנתונים מהשרת
  }

  fetchData(): void {
    this.apiService.getData().subscribe(
      (response) => {
        this.data = response;
        this.splitDataByType(); // פיצול הנתונים לפי סוגים
        this.formatYear(); // עיצוב שנה לתצוגה
        this.sortData(); // מיון הנתונים
        this.selectTab('movie'); // בחירת טאב ראשוני
      },
      (error) => {
        this.errorMessage = error;
      }
    );
  }

  splitDataByType(): void {
    this.splittedData = this.data.reduce((acc, item) => {
      const type = item.Type || 'Unknown';
      if (!acc[type]) {
        acc[type] = [];
      }
      acc[type].push(item);
      return acc;
    }, {});
    this.tabNames = Object.keys(this.splittedData);

    if (this.tabNames.includes('movie')) {
      this.selectedTab = 'movie';
    } else {
      this.selectedTab = this.tabNames[0];
    }

    this.filteredData = [...this.splittedData[this.selectedTab]];
  }

  selectTab(tab: string): void {
    this.selectedTab = tab;
    this.filteredData = [...this.splittedData[tab]];
  }

  formatYear(): void {
    if (this.data && Array.isArray(this.data)) {
      this.data.forEach((item: any) => {
        const year = item.Year.substring(0, 4);
        item.year = year;
      });
    } else {
      console.error('Data is not defined or not an array');
    }
  }

  search(): void {
    this.filteredData = this.splittedData[this.selectedTab].filter(
      (item: any) =>
        item.Title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        item.Year.toString().includes(this.searchTerm)
    );
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.search();
  }

  refreshData(): void {
    this.fetchData();
  }

  toggleView(): void {
    this.view = this.view === 'list' ? 'grid' : 'list';
  }

  sortData(): void {
    this.filteredData.sort((a, b) => {
      const nameA = a.Title.toLowerCase();
      const nameB = b.Title.toLowerCase();
      if (this.sortDirection === 'asc') {
        return nameA < nameB ? -1 : nameA > nameB ? 1 : 0;
      } else {
        return nameA > nameB ? -1 : nameA < nameB ? 1 : 0;
      }
    });
  }

  toggleSortDirection(): void {
    this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    this.cdr.detectChanges(); // לעדכן את המחזור הנוכחי לפני ביצוע השינוי הבא
    this.sortData();
  }

  editTitle(item: any): void {
    this.editing = true;
    this.originalTitle = item.Title;
  }

  saveTitle(item: any): void {
    if (!item.Title.trim()) {
      alert('Title cannot be empty');
      item.Title = this.originalTitle;
      this.editing = false;
      return;
    }

    if (item.Title !== this.originalTitle) {
      this.editing = false;

      const updatedItem = { id: item.id, Title: item.Title };

      this.apiService.updateItem(updatedItem).subscribe(
        (response) => {},
        (error) => {
          console.error('Update failed:', error);
        }
      );
    } else {
      this.editing = false;
    }
    this.cdr.detectChanges(); // לעדכן את המחזור הנוכחי לפני ביצוע השינוי הבא
    this.toggleSortDirection();
  }

  goToItem(id: string): void {
    this.router.navigate(['/item', id]);
  }

  handleImageError(event: any): void {
    event.target.style.display = 'none';
  }
}
